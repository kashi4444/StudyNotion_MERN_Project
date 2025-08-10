const express = require("express");
const app = express();

//import routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactRoutes = require("./routes/Contact");

//datbase connect
const dbConnect = require("./config/database")
dbConnect();

const cookieParser = require("cookie-parser")
const cors = require("cors");

//cloudinary connection
const {cloudinaryConnect} = require("./config/cloudinary")
cloudinaryConnect();

const fileUpload = require("express-fileupload")

const dotenv = require("dotenv")
dotenv.config();

const PORT = process.env.PORT || 4001;

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp"
    })
)
//routes 
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/contact", contactRoutes);

app.get("/", (req, res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running....."
    })
})

app.listen(PORT, ()=>{
    console.log(`App is running at ${PORT}`)
})