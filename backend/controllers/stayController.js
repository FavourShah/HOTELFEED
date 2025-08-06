import { Stay } from "../models/stay.js";


export const getGuestStayHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const stays = await Stay.find({ userId })
      .populate("userId", "fullName phone email") // attach guest details
      .sort({ checkinDate: -1 }); // most recent stay first

    res.status(200).json(stays);
  } catch (err) {
    console.error("Stay history fetch error:", err);
    res.status(500).json({ message: "Failed to retrieve stay history" });
  }
};
