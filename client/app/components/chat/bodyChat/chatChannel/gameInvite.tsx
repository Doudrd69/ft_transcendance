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
		globalState.gameInvite = false;
		if (globalState.gameSocketConnected === false) {
			globalState.gameInviteValidation = false;
			console.log(`INVITATION: ${globalState.userSocket?.id}`);
			globalState.userSocket?.emit('checkAndInviteToGame', {
				usernameToInvite: globalState.targetUsername,
				userIdToInvite: globalState.gameTargetId,
				senderUsername: sessionStorage.getItem("currentUserLogin"),
			});
			globalState.gameSocketConnected = true;
		}
	}



		// const gameInvite = () => {
		// 	console.log("Enter game invite");
		// 	globalState.gameInvite = false;
		// 	if (globalState.gameSocketConnected === false) {
		// 		globalState.gameInviteValidation = false;
		// 		console.log(`INVITATION: ${globalState.userSocket?.id}`);
		// 		// const gameSocket: Socket = io(`${process.env.API_URL}/game`, {
		// 		// 	autoConnect: false,
		// 		// 	auth: {
		// 		// 		token: sessionStorage.getItem("jwt"),
		// 		// 	}
		// 		// });
		// 		// pas de creation de socket, si deny rien, si close rien et accept creation de socket
		// 		// gameSocket.connect();
		// 		// gameSocket.on('connect', () => { // enlever ca
		// 		// dispatch({ type: 'SET_GAME_SOCKET', payload: gameSocket });
		// 		// emit le fait que je rentre en matchmaking, si l'autre refuse je fait un emethode pour le quitter avant de disconnect la socket
		// 		// gameSocket.emit('throwGameInvite') // faire ca auto juste apres le 2e check ingameInvite
		// 		globalState.userSocket?.emit('checkAndInviteToGame', {
		// 			usernameToInvite: globalState.targetUsername,
		// 			userIdToInvite: globalState.gameTargetId,
		// 			senderUsername: sessionStorage.getItem("currentUserLogin"),
		// 		});
		// 		globalState.gameSocketConnected = true;
		// 	}
		// };
		// souci si creation lancement matcmaking au milieu, donc avant de creer les 2 socket mais apres la validation, refaire un check
		// check si le mec est pas deja ingame, puis check si lautre pas ingamer , envoyer invite, attendre recieve, si validation creation des sockets, check dernier de ingame puis lancement de la game.
		// check des deux Users OK TESTE
		// envoyer une invite OK TESTE
		// attendre recieve OK TESTE
		// check usersInGame apres validation OK
		// si validation creer socket puis emit a l'autre avec gameSocketId et l'autre envoie la game, check entre chaque emit et creations de socket le ingame
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