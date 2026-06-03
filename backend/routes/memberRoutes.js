const express =
require("express");

const router =
express.Router();

const {
 getMembers,
 getMember,
 addMember,
 updateMember,
 deleteMember
}
=
require(
 "../controllers/memberController"
);

router.get(
 "/",
 getMembers
);

router.get(
 "/:emp",
 getMember
);

router.post(
 "/",
 addMember
);

router.put(
 "/:emp",
 updateMember
);

router.delete(
 "/:emp",
 deleteMember
);

module.exports =
router;