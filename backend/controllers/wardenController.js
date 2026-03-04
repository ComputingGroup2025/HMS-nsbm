const updateOutingState = require("../utils/updateOutingState");
const logOutingHistory = require("../utils/logOutingHistory");

exports.wardenApprove = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "wardenApprove"
    );

    await logOutingHistory(
      requestId,
      "warden_approved",
      req.user.id
    );

    res.json({
      message: "Warden approved",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.wardenReject = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "wardenReject"
    );

    await logOutingHistory(
      requestId,
      "warden_rejected",
      req.user.id
    );

    res.json({
      message: "Warden rejected",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};