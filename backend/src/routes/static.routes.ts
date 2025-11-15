import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { log } from '../utils/logging.util';

const router = Router();

const serveStaticContent = (filePath: string, title: string) => {
  return (req: Request, res: Response) => {
    const fullPath = path.join(__dirname, '..', '..', 'static_content', filePath);
    
    fs.readFile(fullPath, 'utf8', (err, data) => {
      if (err) {
        log('error', `Failed to read static content: ${filePath}`, { error: err });
        return res.status(500).send('Error reading content.');
      }

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 2rem auto;
              padding: 0 1rem;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              background-color: #f4f4f4;
              padding: 1rem;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <pre>${data}</pre>
        </body>
        </html>
      `;
      
      res.send(html);
    });
  };
};

router.get('/terms', serveStaticContent('terms_and_conditions.md', 'Terms and Conditions'));
router.get('/privacy', serveStaticContent('privacy_policy.md', 'Privacy Policy'));
router.get('/refund', serveStaticContent('refund.md', 'Refund Policy'));

export default router;
