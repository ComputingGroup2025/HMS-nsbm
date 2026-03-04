const updateOutingState = require("../utils/updateOutingState");
const logOutingHistory = require("../utils/logOutingHistory");

exports.parentApprove = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "parentApprove"
    );

    await logOutingHistory(
      requestId,
      "parent_approved",
      req.user.id
    );

    res.json({
      message: "Parent approved",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.parentReject = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "parentReject"
    );

    await logOutingHistory(
      requestId,
      "parent_rejected",
      req.user.id
    );

    res.json({
      message: "Parent rejected",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};