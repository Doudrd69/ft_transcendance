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
	const { chatState, chatDispatch } = useChat();
	
	const gameInvite = () => {

		console.log("Enter game invite");
		globalState.gameInvite = false;
			globalState.gameInviteValidation = false;
			console.log(`INVITATION: ${globalState.userSocket?.id}`);
			globalState.gameSocketConnected = true;
			globalState.userSocket?.emit('checkAndInviteToGame', {
				userIdToInvite: globalState.gameTargetId,
			});
	}

		useEffect(() => {
			console.log("GLOBALSTATE GAME INVITE USE EFFECT: ", globalState.gameInvite);
			if (globalState.gameInvite) {
				gameInvite();
			}
		}, [globalState.gameInvite]);


	return (
		<div></div>
	);
}

export default GameInviteComponent;