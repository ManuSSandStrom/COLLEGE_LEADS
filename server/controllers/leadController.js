const Lead = require('../models/Lead');
const ExcelJS = require('exceljs');

// POST /api/lead
const createLead = async (req, res) => {
  try {
    const {
      studentName, phone, email, institutionName, institutionId,
      type, hostelRequired, courseInterest, message, age, leadSource,
    } = req.body;

    const normalizedSource = ['profile', 'interest', 'enquiry'].includes(leadSource)
      ? leadSource
      : 'enquiry';

    let finalInstitutionName = institutionName;
    if (!finalInstitutionName && normalizedSource === 'profile') {
      finalInstitutionName = 'General Enquiry';
    }

    if (!studentName || !phone || !email || !finalInstitutionName) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, and institution are required.',
      });
    }

    const lead = await Lead.create({
      studentName, phone, email,
      institutionName: finalInstitutionName,
      institutionId,
      type, hostelRequired, courseInterest, message,
      age: age !== undefined && age !== '' ? Number(age) : undefined,
      leadSource: normalizedSource,
    });

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! We will contact you soon.',
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/lead (Admin)
const getAllLeads = async (req, res) => {
  try {
    const { search, institution, page = 1, limit = 50, startDate, endDate, source, excludeSource } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (institution) filter.institutionName = { $regex: institution, $options: 'i' };
    if (source && ['profile', 'interest', 'enquiry'].includes(source)) {
      filter.leadSource = source;
    }
    if (excludeSource && ['profile', 'interest', 'enquiry'].includes(excludeSource)) {
      filter.leadSource = { $ne: excludeSource };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: leads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/lead/:id (Admin)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/export/leads (Admin)
const exportLeadsToExcel = async (req, res) => {
  try {
    const { startDate, endDate, institution } = req.query;
    const filter = {};

    if (institution) filter.institutionName = { $regex: institution, $options: 'i' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mintu bro! Admin';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Student Leads', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Header styling
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 6 },
      { header: 'Student Name', key: 'studentName', width: 22 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Age', key: 'age', width: 6 },
      { header: 'Institution', key: 'institutionName', width: 30 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Hostel Required', key: 'hostelRequired', width: 16 },
      { header: 'Course Interest', key: 'courseInterest', width: 22 },
      { header: 'Source', key: 'leadSource', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Message', key: 'message', width: 35 },
      { header: 'Date', key: 'createdAt', width: 20 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    leads.forEach((lead, index) => {
      const row = worksheet.addRow({
        sno: index + 1,
        studentName: lead.studentName,
        phone: lead.phone,
        email: lead.email,
        age: lead.age || '',
        institutionName: lead.institutionName,
        type: lead.type || 'N/A',
        hostelRequired: lead.hostelRequired ? 'Yes' : 'No',
        courseInterest: lead.courseInterest || 'N/A',
        leadSource: lead.leadSource || 'enquiry',
        status: lead.status || 'New',
        message: lead.message || '',
        createdAt: new Date(lead.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
      }
      row.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    });

    // Auto filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 13 },
    };

    // Freeze header
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const filename = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/lead/stats (Admin)
const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    // Leads per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyLeads = await Lead.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const leadsByInstitution = await Lead.aggregate([
      { $group: { _id: '$institutionName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      data: { totalLeads, dailyLeads, leadsByInstitution },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLead, getAllLeads, deleteLead, exportLeadsToExcel, getLeadStats };
