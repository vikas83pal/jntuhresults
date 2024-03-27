import formidable from "formidable";
export async function GET(req: any, res: any) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      console.error("Error parsing form:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const { file } = files;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
  });
}
