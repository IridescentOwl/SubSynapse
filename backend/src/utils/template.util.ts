import fs from 'fs';
import path from 'path';

export const renderTemplate = (templateName: string, data: { [key: string]: string }): string => {
  const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, data[key]);
  }

  return template;
};
