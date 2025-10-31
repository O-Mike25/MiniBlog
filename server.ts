import express, { Request, Response, NextFunction } from "express";
import router from "./Routes";

const app =  express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", router);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unknown server error";
    res.status(500).json({ message });
})

app.listen(port, () => {
    console.log(`MiniBlog server listening on http://localhost:${port}`)
})