const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.get("/api/maps", async (req, res) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/js`,
            {
                params: {
                    key: API_KEY,
                    ...req.query,
                },
            },
        );
        res.send(response.data);
    } catch (error) {
        res.status(500).send("Error proxying request");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
