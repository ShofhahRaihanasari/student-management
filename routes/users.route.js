const express = require("express");
const { USERS, USER_ROLES, STUDENTS } = require("../items");
const { protect } = require("../middleware");
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: USERS.map((item) => {
      // delete item.password;
      return item;
    }),
  });
});

router.put("/invite",protect, (req, res) => {

// Mendapatkan data dari body permintaan
const invite = req.body;

// Mendapatkan pengguna yang sedang login dari middleware protect
const loggedInUser = req.user;

console.log(invite.user_id);

if (loggedInUser.id === invite.student_id) {
  const student = STUDENTS.find((student) => student.id === invite.student_id);

  if (student) {
    const existingUserRole = student.users_role.find((role) => role.user_id === invite.user_id);
  

  if (existingUserRole) {
    // Jika user_role sudah ada, edit rolenya
    existingUserRole.role = invite.role;
  } else {
    // Jika user_role belum ada, tambahkan data baru
    student.users_role.push({ user_id: invite.user_id, role: invite.role });
  }

  // Kemudian kirim respons yang sesuai
  return res.json({ STUDENTS });

} else {
    // Jika student dengan id tertentu tidak ditemukan
    return res.status(404).json({ message: "Student not found" });
  }
} else {
    // Jika pengguna tidak memiliki izin, kirim pesan error dengan status code 403
    return res.status(403).json({ message: "Access denied" });
  }
});


router.get("/:id", protect, (req, res) => {
  const id = req.params.id;
  const loggedInUser = req.user;

  const user = USERS.filter((item) => item.id === +id)[0];
  if (user.id !== +loggedInUser.id) {
    delete user.username;
    delete user.password;

  }

  return res.json({
    data: user,
  });
});

module.exports = router;
