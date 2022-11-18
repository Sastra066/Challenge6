/**
 * @file contains authentication request handler and its business logic
 * @author Fikri Rahmat Nurhidayat
 */

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY = "Rahasia" } = process.env;
const UserServices = require("../../../services/userServices");
const SALT = 10;

//FUNCTION UNTUK ME ENCRYPT PASSWORD SAAT REGISTRASI
function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT, (err, encryptedPassword) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(encryptedPassword);
    });
  });
}

//FUNCTION CHECK PASSWORD
function checkPassword(encryptedPassword, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, isPasswordCorrect) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(isPasswordCorrect);
    });
  });
}

//FUNCTION membuat token yg akan di kirimakan ke client
function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SIGNATURE_KEY || "Rahasia");
}

function createToken2(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET_KEY);
}

module.exports = {
  encryptPassword,
  //FUNCTION UNTUK REGISTER
  async register(req, res) {
    try {
      if (!req.body.email || !req.body.password) {
        res.status(327).json({
          status: "FAIL",
          message: "check missing fields from requestBody",
        });
      }
      const email = req.body.email;
      const role = "member";
      const encryptedPassword = await encryptPassword(req.body.password);
      const user = await UserServices.create({
        email,
        encryptedPassword,
        role,
      });
      res.status(201).json({
        status: "SUCCESS",
        message: "create user successfully",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(422).json({
        status: "FAIL",
        message: error.message,
      });
    }
  },

  //FUNCTION UNTUK MEMBUAT ADMIN
  async createAdmin(req, res) {
    try {
      if (!req.body.email || !req.body.password) {
        res.status(327).json({
          status: "FAIL",
          message: "check missing fields from requestBody",
        });
      }
      const email = req.body.email;
      const role = "admin";
      const encryptedPassword = await encryptPassword(req.body.password);
      const user = await UserServices.create({
        email,
        encryptedPassword,
        role,
      });
      res.status(201).json({
        status: "SUCCESS",
        message: "create admin successfully",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(422).json({
        status: "FAIL",
        message: error.message,
      });
    }
  },

  //FUNCTION LOGIN
  async login(req, res) {
    try {
      const email = req.body.email.toLowerCase(); // Biar case insensitive
      const password = req.body.password;

      const user = await UserServices.findOne({
        where: { email },
      });

      //pengecekan email
      if (!user) {
        res.status(404).json({ message: "Email tidak ditemukan" });
        return;
      }

      //pengecekan password yang telah di compare dari method checkPassword()
      const isPasswordCorrect = await checkPassword(
        user.encryptedPassword,
        password
      );
      //PENGECEKAN JIKA PASSWORD SALAH
      if (!isPasswordCorrect) {
        res.status(405).json({ message: "Password salah!" });
        return;
      }

      //TOKEN DI BUAT DARI METHOD createToken(), LALU DI MASUKUAN KE DALAM KE DALAM TOKEN
      const token = createToken({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      //RESPON YANG DI TAMPILKAN KE CLIENT
      res.status(201).json({
        status: "SUCCESS",
        message: "Login successfully",
        data: {
          id: user.id,
          email: user.email,
          token,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(422).json({
        status: "FAIL",
        message: error.message,
      });
    }
  },

  //FUNCTION UNTUK MENGETAHUI SIAPA YANG SEDANG MENGAKSES DATA
  async whoAmI(req, res) {
    res.status(200).json(req.user);
  },

  //FUNCTION UNTUK PENGECEKAN SAAT LOGIN
  async authorize(req, res, next) {
    try {
      const bearerToken = req.headers.authorization;
      const token = bearerToken.split("Bearer ")[1];
      const tokenPayload = jwt.verify(
        token,
        process.env.JWT_SIGNATURE_KEY || "Rahasia"
      );

      //PENCARIAN DATA USER BERDASARKAN DARI TOKEN ID YANG LOGIN
      req.user = await UserServices.findByPk(tokenPayload.id);
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({
        status: "FAIL",
        message: "UNAUTHORIZED",
      });
    }
  },
  async handleGoogleLoginOrRegister(req, res) {
    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      });

      const { email, name } = ticket.getPayload();

      console.log(ticket.getPayload());

      let user = await UserServices.findOne({ where: { email: email } });
      if (!user) user = await UserServices.create({ email, name });

      const accessToken = createToken2(user);

      res.status(201).json({ accessToken });
    } catch (err) {
      res.status(401).json({ error: { name: err.name, message: err.message } });
    }
  },
};
