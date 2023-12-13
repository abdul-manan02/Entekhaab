import Constituencies from "../models/constituencies.js";
import axios from "axios";

const getAllConstituencies = async (req, res) => {
  try {
    const constituencies = await Constituencies.find();
    if (constituencies.length == 0) return res.send("EMPTY");
    res.json({ constituencies });
  } catch (error) {
    res.status(404).json(error);
  }
};

const createConstituency = async (req, res) => {
  try {
    const { name, position } = req.body;
    const { province, district, city, area } = position;
    if (!/^(NA|PP|PS|PK|PB)-\d{1,3}$/.test(name))
      return res.send("INCORRECT NAME");
    const newConstituency = await Constituencies.create(req.body);
    res.json(newConstituency);
  } catch (error) {
    res.status(404).json(error);
  }
};

const updateConstituency = async (req, res) => {
  try {
    const { name } = req.params;
    const { areas } = req.body;
    const constituency = await Constituencies.findOneAndUpdate(
      { name },
      { $set: { "position.areas": areas } },
      { new: true, runValidators: true }
    );
    res.json(constituency);
  } catch (error) {
    res.status(404).send(error);
  }
};

const deleteConstituency = async (req, res) => {
  try {
    const { name } = req.params;
    const constituency = await Constituencies.findOneAndDelete({ name });
    if (constituency) res.send(constituency);
    else res.status(404).json({ msg: `Constituency ${name} NOT FOUND` });
  } catch (error) {
    res.status(404).send(error);
  }
};

export {
  getAllConstituencies,
  createConstituency,
  updateConstituency,
  deleteConstituency,
};
