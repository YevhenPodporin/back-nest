import process from 'process';

export default function getImageUrl(filePath: string): string {
	// Assuming you have some logic to construct the full URL for the image
	return filePath ? process.env['BACKEND_IMAGE_URL'] + filePath : null;
}
