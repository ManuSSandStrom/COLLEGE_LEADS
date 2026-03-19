export const statesList = ['Andhra Pradesh', 'Telangana'];

export const townsByState = {
  'Andhra Pradesh': [
    'Anakapalli', 'Anantapur', 'Bapatla', 'Chittoor', 'East Godavari',
    'Eluru', 'Guntur', 'Kakinada', 'Konaseema', 'Krishna', 'Kurnool',
    'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
    'Srikakulam', 'Sri Potti Sriramulu Nellore', 'Tirupati',
    'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa',
  ],
  Telangana: [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad',
    'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
    'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad',
    'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri',
    'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
    'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy',
    'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
    'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri',
  ],
};

export const allTowns = Array.from(
  new Set(Object.values(townsByState).flat())
).sort((a, b) => a.localeCompare(b));

