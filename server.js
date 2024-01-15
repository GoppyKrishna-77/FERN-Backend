const express = require("express");
const app = express();

const port = 8080;

const { db } = require("./firebase.js");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const parts = file.originalname.split('.');
        const filenameWithoutExtension = parts.slice(0, -1).join('.');
        const extension = parts.pop();
        cb(null, `${filenameWithoutExtension}-${timestamp}.${extension}`);
    }
});

const upload = multer({ storage: storage});

app.use(express.json());


app.post("/admin/card", upload.single("backgroundImg"), async (req, res) => {
	try {
        console.log(req.body);
        console.log(req.file);
        const form_data = JSON.parse(req.body.data);
		const id = form_data.id;
		const data = {
			eventTitle: form_data.eventTitle,
			unregisterLink: form_data.unregisterLink,
			registerLink: form_data.registerLink,
			backgroundImg: req.file.filename,
		};
		const cardsdb = db.collection("cards");
		const response = await cardsdb.doc(id).set(data);
		res.status(200).send(response);
	} catch (err) {
		res.send(err);
	}   
});

app.get("/admin/card", async (req, res) => {
	try {
		const cardsdb = db.collection("cards");
		const resp = await cardsdb.get();
        const data = {}
        resp.forEach(doc => {
            data[doc.id] = doc.data();
        });
		res.status(200).send(data);
	} catch (err) {
		res.send(err);
	}
});

app.get("/admin/card/:id", async(req, res) => {
    try {
        const cardsdb = db.collection("cards");
        const id = req.params.id;
        const data = await cardsdb.doc(id).get();
        console.log(data.data());
        res.status(200).send(data.data());
    }
    catch (err) {
        res.send(err);
    }
});

app.put("/admin/card", async (req, res) => {
	try {
		const cardsdb = db.collection("cards");
		const id = req.body.id;
		const resp = await cardsdb.doc(id).update({
			eventTitle: req.body.eventTitle,
			unregisterLink: req.body.unregisterLink,
			registerLink: req.body.registerLink,
			backgroundImg: req.body.backgroundImg,
		});
		res.status(200).send(resp);
	} catch (err) {
		res.send(err);
	}
});

app.delete("/admin/card", async (req, res) => {
	try {
		const cardsdb = db.collection("cards");
		const id = req.body.id;
		const resp = await cardsdb.doc(id).delete();
		res.status(200).send(resp);
	} catch (err) {
		res.send(err);
	}
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));
