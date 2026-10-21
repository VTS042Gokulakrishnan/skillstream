const Candidate = require("../../models/candidateModel");
exports.get = async (req, res, next) => {
  try {
    if (req.user.role !== "Candidate") return res.sendStatus(403);
    res.json({ preferred_locations: req.user.preferred_locations || [] });
  } catch (error) { next(error); }
};
exports.save = async (req, res, next) => {
  try {
    if (req.user.role !== "Candidate") return res.sendStatus(403);
    const cities = req.body.preferred_locations;
    if (!Array.isArray(cities) || cities.length > 20 || cities.some((city) => typeof city !== "string" || !city.trim() || city.length > 100)) {
      return res.status(400).json({ message: "Choose up to 20 valid cities." });
    }
    const unique = [...new Map(cities.map((city) => [city.trim().toLowerCase(), city.trim()])).values()];
    await Candidate.updateOne({ _id: req.user._id }, { $set: { preferred_locations: unique } });
    res.json({ preferred_locations: unique });
  } catch (error) { next(error); }
};
