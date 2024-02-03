import React, { use, useState, useEffect } from 'react';
import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { io, Socket } from 'socket.io-client';
import { handleWebpackExternalForEdgeRuntime } from 'next/dist/build/webpack/plugins/middleware-plugin';
import { setGameSocket, useGlobal } from '@/app/GlobalContext';
import { ToastContainer, toast } from 'react-toastify';


interface User {
	id: number;
	username: string;
	isBlocked: boolean;

}
interface gameInviteComponentProps {
	user: User;
	all: boolean
}

const gameInviteComponent: React.FC<gameInviteComponentProps> = ({ user, all }) => {

	const { globalState, dispatch } = useGlobal();
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const { chatState, chatDispatch } = useChat();

	const gameInvite = () => {
		console.log("gameSocketConnected :", globalState?.gameSocket);
		// !gameInviteCalled && gameSocketConnected === false
		if (gameSocketConnected === false) {
			// setGameInviteCalled(true); // Marquer gameInvite comme appelée
			globalState.userSocket?.off('senderNotInGame');
			setgameInviteValidation(false);
			console.log("GAMEINVITE");
			globalState.userSocket?.emit('checkSenderInMatch', {
				senderUsername: sessionStorage.getItem("currentUserLogin"),
				senderUserId: sessionStorage.getItem("currentUserID"),
			})
			globalState.userSocket?.on('senderNotInGame', () => {
				console.log(`INVITATION: ${globalState.userSocket?.id}`);
				const gameSocket: Socket = io('http://localhost:3001/game', {
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
						usernameToInvite: user.username,
						userIdToInvite: user.id,
						senderID: gameSocket.id,
						senderUsername: sessionStorage.getItem("currentUserLogin"),
						senderUserID: sessionStorage.getItem("currentUserID"),
					});
				})
			})
		}
	};
	// stock une fois a chaque fois, recoi
	// si je suis inMatchmaking tt va bien, par contre si j'invite mais que en meme temps je lance un matchmaking? le matchmaking check si je suis ingame 

	useEffect(() => {
		console.log("UseEffect gameSocketConnected :", gameSocketConnected)
	}, [gameSocketConnected, gameInviteValidation]);


	useEffect(() => {
		console.log("useEfeccts trigged")
		if (typeof globalState.gameSocket !== "undefined") {
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
		else {
			console.log("gameSocket undefined");
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

export default gameInviteComponent;