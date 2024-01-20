	import React, { useState } from 'react';
	import './FileDropZone.css';
	import * as fs from 'fs';

	interface FileDropZoneProps {
		onChange: (image: File | null) => void;
	}

	const FileDropZoneComponent: React.FC<FileDropZoneProps> = ({ onChange }) => {
		const [isDragging, setIsDragging] = useState(false);
		console.log("ahaahahahaha")
		const handleDragEnter = () => {
			setIsDragging(true);
		};

		const handleDragLeave = () => {
			setIsDragging(false);
		};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	  
		
		try {
			const files = e.dataTransfer.files;
		  
			if (files.length == 1) {
				const droppedFile = files[0];
				const reader = new FileReader();
      
				reader.onload = async (event) => {
					if (event.target) {
						const buffer = Buffer.from(event.target.result as ArrayBuffer);
						const signature = buffer.toString('hex', 0, 8);

						if (signature === '89504e470d0a1a0a') {
						onChange(droppedFile);
						} else {
							console.error('Le fichier n\'est pas un PNG valide');
							onChange(null);
						}
					}
				};
			reader.readAsArrayBuffer(droppedFile);
			}
			else {
				throw new Error('Vous ne pouvez déposer qu\'un seul fichier');
			}
		} catch (error) {
			onChange(null);
			console.error('Erreur lors de la vérification du format', error);
		}
	};

	return (
		<div className='bloc-drag-avatar'>
			<div className="drag-and-drop">Drag and Drop here : </div>
			<div
			className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
			onDragEnter={handleDragEnter}
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			>
			</div>
		</div>
	);
	};

	export default FileDropZoneComponent;
