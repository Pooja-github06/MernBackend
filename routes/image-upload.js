// // // image-upload.js
// // import express from 'express';
// // import multer from 'multer';
// // import Jimp from 'jimp';
// // import fs from 'fs';
// // import path from 'path';

// // const router = express.Router();

// // // Ensure uploads folder exists
// // const uploadDir = path.join('uploads');
// // if (!fs.existsSync(uploadDir)) {
// //     fs.mkdirSync(uploadDir);
// // }

// // // Setup multer with memory storage
// // const upload = multer({ storage: multer.memoryStorage() });

// // // Route to handle image upload & compression
// // router.post('/upload', upload.single('image'), async (req, res) => {
// //     if (!req.file) {
// //         return res.status(400).json({ message: 'No file uploaded' });
// //     }

// //     const { buffer, originalname, size } = req.file;

// //     try {
// //         const isLarge = size > 1 * 1024 * 1024; // >1MB
// //         const image = await Jimp.read(buffer);

// //         let filename;
// //         if (isLarge) {
// //             image.quality(60); // Reduce quality if large
// //             filename = `compressed_${Date.now()}_${originalname}`;
// //         } else {
// //             filename = `uncompressed_${Date.now()}_${originalname}`;
// //         }

// //         const filepath = path.join('uploads', filename);
// //         await image.writeAsync(filepath);

// //         res.status(200).json({
// //             message: isLarge
// //                 ? 'Image compressed and saved'
// //                 : 'Image saved without compression',
// //             filename,
// //         });
// //     } catch (err) {
// //         console.error('Error:', err);
// //         res.status(500).json({ message: 'Image processing failed' });
// //     }
// // });

// // export default router;

// import express from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Dynamically import jimp (CommonJS module in ESM)
// const Jimp = (await import('jimp')).default;

// const router = express.Router();

// // Ensure uploads folder exists
// const uploadDir = join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // Setup multer with memory storage
// const upload = multer({ storage: multer.memoryStorage() });

// // Route to handle image upload & compression
// router.post('/upload', upload.single('image'), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const { buffer, originalname, size } = req.file;

//     try {
//         const isLarge = size > 1 * 1024 * 1024; // >1MB
//         const image = await Jimp.read(buffer);

//         let filename;
//         if (isLarge) {
//             image.quality(60); // Reduce quality if large
//             filename = `compressed_${Date.now()}_${originalname}`;
//         } else {
//             filename = `uncompressed_${Date.now()}_${originalname}`;
//         }

//         const filepath = join(uploadDir, filename);
//         await image.writeAsync(filepath);

//         res.status(200).json({
//             message: isLarge
//                 ? 'Image compressed and saved'
//                 : 'Image saved without compression',
//             filename,
//         });
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ message: 'Image processing failed' });
//     }
// });

// export default router;
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import jimp (CommonJS inside ESM)
const Jimp = (await import('jimp')).default;

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Optional: max 5MB
}).single('image');

// Route with proper error handling
router.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // Multer error like LIMIT_FILE_SIZE or LIMIT_UNEXPECTED_FILE
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // Other errors
            return res.status(500).json({ message: 'Upload failed', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { buffer, originalname, size } = req.file;

        try {
            const isLarge = size > 1 * 1024 * 1024;
            const image = await Jimp.read(buffer);

            let filename;
            if (isLarge) {
                image.quality(60); // Compress
                filename = `compressed_${Date.now()}_${originalname}`;
            } else {
                filename = `uncompressed_${Date.now()}_${originalname}`;
            }

            const filepath = join(uploadDir, filename);
            await image.writeAsync(filepath);

            res.status(200).json({
                message: isLarge
                    ? 'Image compressed and saved'
                    : 'Image saved without compression',
                filename,
            });
        } catch (err) {
            console.error('Processing error:', err);
            res.status(500).json({ message: 'Image processing failed' });
        }
    });
});

export default router;
