	import React, { useState } from 'react';
	import './FileDropZone.css';
	import * as fs from 'fs';

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

		// const handleDrop = async (e: React.DragEvent) => {
		// 	e.preventDefault();
		// 	setIsDragging(false);
		// 	try {
		// 	  const files = await e.dataTransfer.files;
		// 	  console.log(files);
			  
		// 	  if (files.length === 1) {
		// 		  const droppedFile = files[0];
		// 		  console.log("droppedFile", droppedFile);
		// 		  console.log("Chemin du fichier:", droppedFile.path);
		// 		const reader = new FileReader();

		// 		reader.onerror = (event) => {
		// 			console.error("Erreur lors de la lecture du fichier", event);
				
		// 			// Ajoutez ces lignes pour obtenir des informations détaillées sur l'erreur
		// 			if (event.target?.error) {
		// 				console.error("Code d'erreur:", event.target.error.code);
		// 				console.error("Message d'erreur:", event.target.error.message);
		// 			}
		// 		}

		// 		reader.onload = (event: ProgressEvent<FileReader>) => {
		// 			console.log("coucouc 1-1");
		// 			const result = event.target?.result;
		// 			console.log("coucou 1-2");
		// 			if (result) {
		// 				console.log("coucou 1-3");
		// 			  const buffer = Buffer.from(result as ArrayBuffer);
		// 			  const signature = buffer.toString('hex', 0, 8);
				  
		// 			  if (signature === '89504e470d0a1a0a') {
		// 				onChange(droppedFile);
		// 			  } else {
		// 				console.error('Le fichier n\'est pas un PNG valide');
		// 				onChange(null);
		// 			  }
		// 			}
		// 		};
		// 		console.log("coucou 1-4");
		// 		reader.readAsArrayBuffer(droppedFile);  // Ajoutez cette ligne
		// 	  } else {
		// 		throw new Error('Vous ne pouvez déposer qu\'un seul fichier');
		// 	  }
		// 	} catch (error) {
		// 	  onChange(null);
		// 	  console.error('Erreur lors de la vérification du format', error);
		// 	}
		//   };

		const handleDrop = async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			
			try {
				const files = await e.dataTransfer.files;
		
				if (files.length === 1) {
					const droppedFile = files[0];
		
					// Utilisez la méthode webkitRelativePath pour obtenir le chemin relatif du fichier
					const filePath = droppedFile.webkitRelativePath || droppedFile.name;
		
					const reader = new FileReader();
					reader.onload = (event: ProgressEvent<FileReader>) => {
						const result = event.target?.result;
		
						if (result) {
							const buffer = Buffer.from(result as ArrayBuffer);
							const signature = buffer.toString('hex', 0, 8);
		
							if (signature === '89504e470d0a1a0a') {
								onChange(droppedFile);
							} else {
								console.error("Le fichier n'est pas un PNG valide");
								onChange(null);
							}
						}
					};
					reader.readAsArrayBuffer(droppedFile);  // Ajoutez cette ligne
				} else {
					throw new Error("Vous ne pouvez déposer qu'un seul fichier");
				}
			} catch (error) {
				onChange(null);
				console.error("Erreur lors de la vérification du format", error);
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
	/**
	 * flatpak run --filesystem=home com.google.Chrome
	 * flatpak run --filesystem=host com.google.Chrome
	 */
	};

	export default FileDropZoneComponent;
