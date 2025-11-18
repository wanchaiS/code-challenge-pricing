import express from "express";
const app = express();
const port = process.env["PORT"] ?? "9001";

app.get("/", (_, res) => {
  res.send("Hello World!");
  console.log("Response sent");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
