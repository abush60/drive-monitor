import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDriveClient } from '../../../lib/driveClient';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const drive = getDriveClient(session.accessToken);

        const form = formidable({
            keepExtensions: true,
            maxFileSize: 100 * 1024 * 1024, // 100MB limit
        });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve([fields, files]);
            });
        });

        const folderId = fields.folderId ? fields.folderId[0] : 'root';
        const file = files.file ? files.file[0] : null;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Google Driveへアップロード
        const response = await drive.files.create({
            requestBody: {
                name: file.originalFilename,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.filepath),
            },
            fields: 'id, name, mimeType, webViewLink, webContentLink',
        });

        // 一時ファイルを削除
        try {
            fs.unlinkSync(file.filepath);
        } catch (e) {
            console.warn('Temporary file cleanup failed:', e);
        }

        return res.status(200).json({
            success: true,
            file: response.data,
        });

    } catch (error) {
        console.error('アップロードエラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
