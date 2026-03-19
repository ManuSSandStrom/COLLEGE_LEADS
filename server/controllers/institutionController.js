const Institution = require('../models/Institution');
const { cloudinary } = require('../config/cloudinary');

// GET /api/institution
const getAllInstitutions = async (req, res) => {
  try {
    const { location, type, name, state, page = 1, limit = 20, featured } = req.query;
    const filter = {};

    if (state && state !== 'all') filter.state = state;
    if (location && location !== 'all') filter.location = { $regex: location, $options: 'i' };
    if (type && type !== 'all') filter.type = type;
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (featured === 'true') filter.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Institution.countDocuments(filter);
    const institutions = await Institution.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const states = await Institution.distinct('state');
    const locationFilter = {};
    if (state && state !== 'all') locationFilter.state = state;
    const locations = await Institution.distinct('location', locationFilter);

    return res.status(200).json({
      success: true,
      data: institutions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      states,
      locations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/institution/:id
const getInstitutionById = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }
    return res.status(200).json({ success: true, data: institution });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const parseList = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
};

const parseFeesByYear = (value) => {
  let items = value;
  if (typeof value === 'string') {
    try {
      items = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      year: item?.year ? String(item.year).trim() : '',
      fee: item?.fee !== undefined ? Number(item.fee) : undefined,
    }))
    .filter((item) => item.year && Number.isFinite(item.fee));
};

// POST /api/institution (Admin)
const createInstitution = async (req, res) => {
  try {
    const {
      name, type, state, location, fees, courses, hostelAvailable,
      description, facilities, featured, rating, establishedYear, website,
      feesByYear, contactEmail, contactPhone,
    } = req.body;

    const imageUrl = req.file ? req.file.path : '';
    const imagePublicId = req.file ? req.file.filename : '';

    const coursesArr = parseList(courses);
    const facilitiesArr = parseList(facilities);
    const feesByYearArr = parseFeesByYear(feesByYear);

    const institution = await Institution.create({
      name, type, state, location,
      fees: parseFloat(fees),
      courses: coursesArr,
      feesByYear: feesByYearArr,
      hostelAvailable: hostelAvailable === 'true' || hostelAvailable === true,
      imageUrl, imagePublicId, description,
      facilities: facilitiesArr,
      featured: featured === 'true' || featured === true,
      rating: parseFloat(rating) || 4.0,
      establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
      website,
      contactEmail,
      contactPhone,
    });

    return res.status(201).json({ success: true, message: 'Institution created successfully', data: institution });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/institution/:id (Admin)
const updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    const {
      name, type, state, location, fees, courses, hostelAvailable,
      description, facilities, featured, rating, establishedYear, website,
      feesByYear, contactEmail, contactPhone,
    } = req.body;

    let imageUrl = institution.imageUrl;
    let imagePublicId = institution.imagePublicId;

    if (req.file) {
      // Delete old image from Cloudinary
      if (institution.imagePublicId) {
        await cloudinary.uploader.destroy(institution.imagePublicId);
      }
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const coursesArr = courses !== undefined ? parseList(courses) : institution.courses;
    const facilitiesArr = facilities !== undefined ? parseList(facilities) : institution.facilities;
    const feesByYearArr = feesByYear !== undefined ? parseFeesByYear(feesByYear) : institution.feesByYear;

    const updated = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        name: name || institution.name,
        type: type || institution.type,
        state: state || institution.state,
        location: location || institution.location,
        fees: fees !== undefined ? parseFloat(fees) : institution.fees,
        courses: coursesArr,
        feesByYear: feesByYearArr,
        hostelAvailable: hostelAvailable !== undefined
          ? (hostelAvailable === 'true' || hostelAvailable === true)
          : institution.hostelAvailable,
        imageUrl,
        imagePublicId,
        description: description !== undefined ? description : institution.description,
        facilities: facilitiesArr,
        featured: featured !== undefined
          ? (featured === 'true' || featured === true)
          : institution.featured,
        rating: rating ? parseFloat(rating) : institution.rating,
        establishedYear: establishedYear ? parseInt(establishedYear) : institution.establishedYear,
        website: website || institution.website,
        contactEmail: contactEmail || institution.contactEmail,
        contactPhone: contactPhone || institution.contactPhone,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Institution updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/institution/:id (Admin)
const deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    if (institution.imagePublicId) {
      await cloudinary.uploader.destroy(institution.imagePublicId);
    }

    await Institution.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Institution deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/institution/stats
const getStats = async (req, res) => {
  try {
    const totalInstitutions = await Institution.countDocuments();
    const totalSchools = await Institution.countDocuments({ type: 'School' });
    const totalColleges = await Institution.countDocuments({ type: 'College' });

    return res.status(200).json({
      success: true,
      data: { totalInstitutions, totalSchools, totalColleges },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getStats,
};
