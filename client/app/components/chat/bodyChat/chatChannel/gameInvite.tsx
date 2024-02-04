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

	console.log("===> GLOBALSTATE GAME INVITE: ", globalState.gameInvite);
	console.log(`[GameInviteComponent]: globalstate{userID, targetId}: {${globalState.gameUserId}, ${globalState.gameTargetId}}`)

	const gameInvite = () => {
		console.log("Enter game invite");
		// !gameInviteCalled && gameSocketConnected === false
		globalState.gameInvite = false;
		if (globalState.gameSocketConnected === false) {
			// setGameInviteCalled(true); // Marquer gameInvite comme appelée
			console.log("gameSocket is false");
			globalState.userSocket?.off('senderNotInGame');
			globalState.gameInviteValidation = false;
			globalState.userSocket?.emit('checkSenderInMatch', {
				senderUsername: sessionStorage.getItem("currentUserLogin"),
				senderUserId: sessionStorage.getItem("currentUserID"),
			})
			// check userToInvite not ingame
			globalState.userSocket?.on('senderNotInGame', () => {
				console.log(`INVITATION: ${globalState.userSocket?.id}`);
				const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
					autoConnect: false,
					auth: {
						token: sessionStorage.getItem("jwt"),
					}
				});
				// pas de creation de socket, si deny rien, si close rien et accept creation de socket
				gameSocket.connect();
				gameSocket.on('connect', () => { // enlever ca
					globalState.gameSocketConnected = true;
					dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
					// emit le fait que je rentre en matchmaking, si l'autre refuse je fait un emethode pour le quitter avant de disconnect la socket
					gameSocket.emit('throwGameInvite') // faire ca auto juste apres le 2e check ingameInvite
					globalState.userSocket?.emit('inviteToGame', {
						usernameToInvite: globalState.targetUsername,
						userIdToInvite: globalState.gameTargetId,
						senderID: gameSocket.id,
						senderUsername: sessionStorage.getItem("currentUserLogin"),
					}); // invite to game mais sans sendID
				}) // deja mettre les .on hors d'ici pour voir ou je peux les mettre

			})
		}
	};

	// check si le mec est pas deja ingame, puis check si lautre pas ingamer , envoyer invite, attendre recieve, si validation creation des sockets, check dernier de ingame puis lancement de la game.

	useEffect(() => {
		console.log("GLOBALSTATE GAME INVITE USE EFFECT: ", globalState.gameInvite);
		if (globalState.gameInvite)
			gameInvite();
	}, [globalState.gameInvite]);

	// useEffect(() => {

	// 	console.log("useEfects triggerd")

	// 	if (typeof globalState.gameSocket !== "undefined") {

	// 		console.log("Enter events in use-effect");

	// 		globalState.gameSocket.on('acceptInvitation', () => {
	// 			console.log("VALIDATION");
	// 			globalState.gameInviteValidation = true;
	// 			globalState.gameSocketConnected = false;
	// 		});
	// 		globalState.userSocket?.on('deniedInvitation', () => {
	// 			console.log("DENIED :", globalState.gameSocket?.id)
	// 			globalState.gameSocketConnected = false;
	// 			globalState.gameSocket?.emit('gameInviteRejected')
	// 			// enlever le userGameSockets
	// 			globalState.gameSocket?.disconnect();

	// 		});
	// 		globalState.userSocket?.on('userToInviteAlreadyInGame', () => {
	// 			globalState.gameSocketConnected = false;
	// 			// enlever le userGameSockets
	// 			globalState.gameSocket?.emit('gameInviteRejected')
	// 			globalState.gameSocket?.disconnect();

	// 		});
	// 		globalState.userSocket?.on('senderInGame', () => {
	// 			globalState.gameSocketConnected = false;
	// 		})
	// 		globalState.userSocket?.on('closedInvitation', () => {
	// 			console.log("CLOSED :", globalState.gameSocket?.id)
	// 			if (globalState.gameInviteValidation == false) {
	// 				// enlever le userGameSockets
	// 				console.log("CLOSED DENY :", globalState.gameSocket?.id)
	// 				globalState.gameSocketConnected = false;
	// 				globalState.gameSocket?.emit('gameInviteRejected')
	// 				globalState.gameSocket?.disconnect();
	// 			}
	// 			globalState.gameSocketConnected = false;
	// 		});
	// 	}

	// 	return () => {
	// 		globalState.gameSocket?.off('acceptInvitation');
	// 		globalState.userSocket?.off('closedInvitation');
	// 		globalState.userSocket?.off('deniedInvitation');
	// 		globalState.gameSocket?.off('disconnect');
	// 	};

	// }, [globalState?.gameSocket, globalState.gameInviteValidation, globalState?.userSocket, globalState.gameSocketConnected]);

	return (
		<div></div>
	);
}

export default GameInviteComponent;