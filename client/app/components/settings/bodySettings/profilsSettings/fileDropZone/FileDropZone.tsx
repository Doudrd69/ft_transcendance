import React, { useState } from 'react';
import { Image } from 'image-js';

import './FileDropZone.css';

interface FileDropZoneProps {
	onChange: (image: File | null) => void;
}

const FileDropZoneComponent: React.FC<FileDropZoneProps> = ({ onChange }) => {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragEnter = () => {
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		try {
		const files = await e.dataTransfer.files;

		if (files.length === 1) {
			const droppedFile = files[0];

			// Vérifiez si le fichier est au format PNG
			const isValidPNG = await checkIsPNG(droppedFile);
			if (!isValidPNG) {
			console.error("Le fichier n'est pas un PNG valide");
			onChange(null);
			return;
			}
			const data = await readFileAsArrayBuffer(droppedFile);
			const image = await Image.load(data);
			const { width, height } = image;
			const size = Math.min(width, height);
			const canvas = document.createElement('canvas');
			canvas.width = 400;
			canvas.height = 400;
			const ctx = canvas.getContext('2d');
			if (ctx)
			{
				ctx.drawImage(
				image.getCanvas(),
				(width - size) / 2,
				(height - size) / 2,
				size,
				size,
				0,
				0,
				400,
				400
				);
			}
			canvas.toBlob((blob) => {
			if (blob) {
				const croppedFile = new File([blob], droppedFile.name, { type: 'image/png' });
				onChange(croppedFile);
			} else {
				console.error("Erreur lors de la conversion du canvas en Blob");
				onChange(null);
			}
			}, 'image/png');
		} else {
			throw new Error("Vous ne pouvez déposer qu'un seul fichier");
		}
		} catch (error) {
		onChange(null);
		console.error("Erreur lors du traitement de l'image", error);
		}
	};

	const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
		return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target) {
			resolve(event.target.result as ArrayBuffer);
			}
		};
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
		});
	};

	const checkIsPNG = async (file: File): Promise<boolean> => {
		const buffer = await readFileAsArrayBuffer(file);
		const signature = Buffer.from(buffer).toString('hex', 0, 8);
		return signature === '89504e470d0a1a0a';
	};

	return (
		<div
			className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
			onDragEnter={handleDragEnter}
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			title='Drop here'
		>
		</div>
	);
};

export default FileDropZoneComponent;
