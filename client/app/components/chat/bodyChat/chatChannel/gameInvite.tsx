import React, { useEffect } from 'react';
// import ConfirmationComponent from '../../confirmation/Confirmation';
import { useChat } from '@/app/components/chat/ChatContext';
// import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import { useGlobal } from '@/app/GlobalContext';

const GameInviteComponent: React.FC = () => {

	const { globalState, dispatch } = useGlobal();
	const { chatState, chatDispatch } = useChat();
	const gameInvite = () => {
		globalState.gameInvite = false;
		globalState.gameInviteValidation = false;
		globalState.gameSocketConnected = true;
		globalState.userSocket?.emit('checkAndInviteToGame', {
			userIdToInvite: globalState.gameTargetId,
		});
	}

	useEffect(() => {
		if (globalState.gameInvite) {
			gameInvite();
		}
	}, [globalState.gameInvite]);


	return (
		null
	);
}

export default GameInviteComponent;