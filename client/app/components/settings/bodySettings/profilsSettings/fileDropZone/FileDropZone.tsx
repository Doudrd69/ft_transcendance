	import React, { useState } from 'react';
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

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;

		if (files.length > 0) {
		const droppedFile = files[0];

		if (droppedFile.type.startsWith('image/')) {
			onChange(droppedFile);
		} else {
			console.log('Veuillez déposer une image valide.');
			onChange(null);
		}
		}
	};

	return (
		<div
		className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
		onDragEnter={handleDragEnter}
		onDragOver={(e) => e.preventDefault()}
		onDragLeave={handleDragLeave}
		onDrop={handleDrop}
		>
			{/* <div className="drag-and-drop">Drag and Drop here</div> */}
		</div>
	);
	};

	export default FileDropZoneComponent;
