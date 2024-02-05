import React, { use, useState, useEffect } from 'react';
// import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
// import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { io, Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { setGameSocket, useGlobal } from '@/app/GlobalContext';
import { ToastContainer, toast } from 'react-toastify';

const GameInviteComponent: React.FC = () => {

	const { globalState, dispatch } = useGlobal();
	// const [gameSocketConnected, globalState.gameSocketConnected = =] = useState<boolean>(false);
	// const [gameInviteValidation, globalState.gameInviteValidation =] = useState<boolean>(false);
	const { chatState, chatDispatch } = useChat();
	
	const gameInvite = () => {

		console.log("Enter game invite");
		globalState.gameInvite = false;
			globalState.gameInviteValidation = false;
			console.log(`INVITATION: ${globalState.userSocket?.id}`);
			globalState.gameSocketConnected = true;
			globalState.userSocket?.emit('checkAndInviteToGame', {
				usernameToInvite: globalState.targetUsername,
				userIdToInvite: globalState.gameTargetId,
			});
	}

		useEffect(() => {
			console.log("GLOBALSTATE GAME INVITE USE EFFECT: ", globalState.gameInvite);
			if (globalState.gameInvite) {
				gameInvite();
			}
			// faire un return off des on
		}, [globalState.gameInvite]);

		// useEffect(() => {
		// 	globalState.gameSocket?.on('createGameSocketInvite') {
		// 		const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
		// 			autoConnect: false,
		// 			auth: {
		// 				token: sessionStorage.getItem("jwt"),
		// 			},
		// 		});
		// 		gameSocket.connect();
		// 		gameSocket.on('connect', () => {
		// 			// emit le gameInvite
		// 		});

		// 	}

		// });

	return (
		<div></div>
	);
}

export default GameInviteComponent;