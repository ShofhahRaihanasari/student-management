const express = require("express");
const { STUDENTS } = require("../items");
const { protect } = require("../middleware");
const router = express.Router();

router.use(protect);
router.get("/", (req, res) => {

  const loggedInUser = req.user;

  const filteredStudents = STUDENTS.map((student) => {
    const userRole = student.users_role.find((role) => role.user_id === loggedInUser.id);
    //
    // Jika pengguna adalah pemilik (owner) atau memiliki undangan ke mahasiswa tersebut
    if (student.id === loggedInUser.id || userRole) {
      // Membuat salinan objek mahasiswa dengan perubahan pada properti 'role'
      const studentCopy = {
        id: student.id,
        name: student.name,
        age: student.age,
        gender: student.gender,
        phone_number: student.phone_number,
        created_by_id: student.created_by_id,
        role: userRole ? userRole.role : "owner",
      };
      return studentCopy;
    }

    return {
      id: student.id,
      name: student.name,
      age: student.age,
      gender: student.gender,
      phone_number: student.phone_number,
      created_by_id: student.created_by_id,
      role: [], // Mengubah role ke dalam format array kosong
    };
  }).filter((student) => student.role !== null);

  return res.json({ status: "success", data: STUDENTS });
});

router.post("/", (req, res) => {

  const loggedInUser = req.user;

  const newStudent = { id: STUDENTS.length + 1, ...req.body, created_by_id: loggedInUser.id, users_role: [],
  };
  STUDENTS.push(newStudent);
  return res.json({ status: "success", data: newStudent });
});

router.put("/:id", (req, res) => {

  const { id } = req.params;
  const loggedInUser = req.user;

  const indexId = STUDENTS.map((item) => item.id).indexOf(+id);
  if (indexId === -1) {
    return res
      .status(404)
      .json({ status: "failed", message: "data not found" });
  }
  const student = STUDENTS[indexId];
  // Validasi apakah pengguna memiliki role "owner" atau "editor"
  if (student.created_by_id === loggedInUser.id || (student.users_role && student.users_role.some((role) => role.user_id === loggedInUser.id && role.role === "editor"))) {
    // Perbarui data mahasiswa dengan data yang dikirim dalam request body
    const updatedStudentData = {
      id: +id,
      ...student, // Gunakan data yang ada pada mahasiswa saat ini
      ...req.body, // Perbarui data sesuai dengan body request
    };

    // Perbarui data mahasiswa dalam array STUDENTS
    STUDENTS[indexId] = updatedStudentData;

    return res.json({
      status: "success",
      data: updatedStudentData,
    });
  } else {
    return res.status(403).json({ status: "failed", message: "Access denied" });
  }
  });

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const loggedInUser = req.user;

  const indexId = STUDENTS.map((item) => item.id).indexOf(+id);
  if (indexId === -1) {
    return res
      .status(404)
      .json({ status: "failed", message: "data not found" });
  }

  const student = STUDENTS[indexId];

  // Validasi apakah pengguna adalah pemilik data
  if (student.created_by_id === loggedInUser.id) {
    // Hanya pemilik data yang dapat menghapusnya
    STUDENTS.splice(indexId, 1);

    return res.json({
      status: "success",
      message: "student is removed",
    });
  } else {
    return res.status(403).json({ status: "failed", message: "Access denied" });
  }
});

module.exports = router;
