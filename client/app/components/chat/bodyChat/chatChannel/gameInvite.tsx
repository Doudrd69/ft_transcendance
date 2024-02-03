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
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const { chatState, chatDispatch } = useChat();

	console.log("===> GLOBALSTATE GAME INVITE: ", globalState.gameInvite);
	console.log(`[GameInviteComponent]: globalstate{userID, targetId}: {${globalState.gameUserId}, ${globalState.gameTargetId}}`)

	const gameInvite = () => {
		console.log("Enter game invite");
		// !gameInviteCalled && gameSocketConnected === false
		if (gameSocketConnected === false) {
			// setGameInviteCalled(true); // Marquer gameInvite comme appelée
			console.log("gameSocket is false");
			globalState.userSocket?.off('senderNotInGame');
			setgameInviteValidation(false);
			globalState.userSocket?.emit('checkSenderInMatch', {
				senderUsername: sessionStorage.getItem("currentUserLogin"),
				senderUserId: sessionStorage.getItem("currentUserID"),
			})
			globalState.userSocket?.on('senderNotInGame', () => {
				console.log(`INVITATION: ${globalState.userSocket?.id}`);
				const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
					autoConnect: false,
					auth: {
						token: sessionStorage.getItem("jwt"),
					}
				});
				gameSocket.connect();
				gameSocket.on('connect', () => {
					setgameSocketConnected(true);
					dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
					// emit le fait que je rentre en matchmaking, si l'autre refuse je fait un emethode pour le quitter avant de disconnect la socket
					gameSocket.emit('throwGameInvite')
					globalState.userSocket?.emit('inviteToGame', {
						usernameToInvite: globalState.targetUsername,
						userIdToInvite: globalState.gameTargetId,
						senderID: gameSocket.id,
						senderUsername: sessionStorage.getItem("currentUserLogin"),
					});
				})
			})
		}
	};

	useEffect(() => {
		console.log("GLOBALSTATE GAME INVITE USE EFFECT: ", globalState.gameInvite);
		if (globalState.gameInvite)
			gameInvite();
	}, [globalState.gameInvite]);

	useEffect(() => {

		console.log("useEfects triggerd")

		if (typeof globalState.gameSocket !== "undefined") {

			console.log("Enter events in use-effect");

			globalState.gameSocket.on('acceptInvitation', () => {
				console.log("VALIDATION");
				setgameInviteValidation(true);
				setgameSocketConnected(false);
			});
			globalState.userSocket?.on('deniedInvitation', () => {
				console.log("DENIED :", globalState.gameSocket?.id)
				setgameSocketConnected(false);
				globalState.gameSocket?.emit('gameInviteRejected')
				// enlever le userGameSockets
				globalState.gameSocket?.disconnect();

			});
			globalState.userSocket?.on('userToInviteAlreadyInGame', () => {
				setgameSocketConnected(false);
				// enlever le userGameSockets
				globalState.gameSocket?.emit('gameInviteRejected')
				globalState.gameSocket?.disconnect();

			});
			globalState.userSocket?.on('senderInGame', () => {
				setgameSocketConnected(false);
			})
			globalState.userSocket?.on('closedInvitation', () => {
				console.log("CLOSED :", globalState.gameSocket?.id)
				if (gameInviteValidation == false) {
					// enlever le userGameSockets
					console.log("CLOSED DENY :", globalState.gameSocket?.id)
					setgameSocketConnected(false);
					globalState.gameSocket?.emit('gameInviteRejected')
					globalState.gameSocket?.disconnect();
				}
				setgameSocketConnected(false);
			});
		}

		return () => {
			globalState.gameSocket?.off('acceptInvitation');
			globalState.userSocket?.off('closedInvitation');
			globalState.userSocket?.off('deniedInvitation');
			globalState.gameSocket?.off('disconnect');
		};

	}, [globalState?.gameSocket, gameInviteValidation, globalState?.userSocket, gameSocketConnected]);

	return (
		<div></div>
	);
}

export default GameInviteComponent;