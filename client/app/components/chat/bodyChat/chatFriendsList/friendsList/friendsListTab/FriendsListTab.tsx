import { useGlobal } from '@/app/GlobalContext';
import { useChat } from '@/app/components/chat/ChatContext';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ListMyChannelComponent from '../../../listMyChannel/ListMyChannel';
import ConfirmationComponent from '../../confirmation/Confirmation';
import './FriendsListTab.css';

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
}

interface FriendsListTabComponentProps {
	user: User;
	all: boolean
}

const FriendsListTabComponent: React.FC<FriendsListTabComponentProps> = ({ user, all }) => {

	const { chatState, chatDispatch } = useChat();
	const { globalState, dispatch } = useGlobal();
	const [gameSocketConnected, setgameSocketConnected] = useState<boolean>(false);
	const [gameInviteValidation, setgameInviteValidation] = useState<boolean>(false);
	const [confirmationText, setConfirmationText] = useState('');
	const [funtionToExecute, setFunctionToExecute] = useState<() => void>(() => { });
	const [accepted, setAccepted] = useState(false);

	const blockUser = async () => {

		try {

			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}

			const response = await fetch(`${process.env.API_URL}/users/blockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				user.isBlocked = true;
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
				globalState.userSocket?.emit('joinRoom', { roomName: `whoblocked${user.username}`, roomID: '' });
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const unblockUser = async () => {

		try {
			const BlockUserDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user.username,
			}
			const response = await fetch(`${process.env.API_URL}/users/unblockUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(BlockUserDto),
			});

			if (response.ok) {
				user.isBlocked = false;

				globalState.userSocket?.emit('leaveRoom', { roomName: `whoblocked${user.username}`, roomID: '' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' })
			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handleTabClick = (text: string, functionToExecute: any) => {
		setConfirmationText(text);
		setFunctionToExecute(() => functionToExecute);
		chatDispatch({ type: 'ACTIVATE', payload: 'showConfirmation' });
	};
 
	const handleGameInvite = () => {
		globalState.gameTargetId = user.id;
		globalState.targetUsername = user.username;
		globalState.gameInvite = true;
	}

	const removeFriends = async () => {

		try {
			const removeFriendDto = {
				friendID: user.id,
			}

			const response = await fetch(`${process.env.API_URL}/users/deleteFriendRequest`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`
				},
				body: JSON.stringify(removeFriendDto),
			})

			if (response.ok) {
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showConfirmation' });

				globalState.userSocket?.emit('refreshUser', { userToRefresh: user.username, target: 'refreshFriends', status: true});

			}
			else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handlFriendRequest = async (user: string) => {
		try {

			const friendRequestDto = {
				initiatorLogin: sessionStorage.getItem("currentUserLogin"),
				recipientLogin: user,
			};

			const response = await fetch(`${process.env.API_URL}/users/addfriend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
				},
				body: JSON.stringify(friendRequestDto),
			});

			if (response.ok) {
				
				const data = await response.json();
				if (!data) {
					return;
				}
				
				chatDispatch({ type: 'TOGGLEX', payload: 'refreshFriendsList' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddChannel' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddUser' });
				chatDispatch({ type: 'DISABLE', payload: 'showAddFriend' });

				if (globalState.userSocket?.connected) {
					globalState.userSocket?.emit('joinRoom', { roomName: data.name, roomID: data.id });
					globalState.userSocket?.emit('addFriend', friendRequestDto);
				}
			} else {
				const error = await response.json();
				if (Array.isArray(error.message))
					toast.warn(error.message[0]);
				else
					toast.warn(error.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<div className="bloc-tab">
				<div className='bloc-tab-img1'  onClick={() => handleTabClick(`Etes vous sur de vouloir défier ${user.username} ?`, handleGameInvite)}>
					<img className='image-tab' src="ping-pong.png" />
				</div>
				{all &&
					<div className='bloc-tab-img' onClick={() => handleTabClick(`Etes vous sur de vouloir ajouter à de votre liste d'amies ${user.username} ?`, () => handlFriendRequest(user.username))}>
						<img className='image-tab' src="ajouter-un-ami.png"  />
					</div>
				}
				<div className='bloc-tab-img'  onClick={() => chatDispatch({ type: 'ACTIVATE', payload: 'showListChannelAdd' })}>
					<img className='image-tab' src="ajouter-un-group.png" />
				</div>
				<div className='bloc-tab-img'>
					<img className='image-tab' src="tableau-statistique1.png" />
				</div>
				{!all ? (
					user.isBlocked ? (
						<div className='bloc-tab-img' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, unblockUser)}>
							<img className='image-tab' src="bloquer-un-utilisateur1.png" />
						</div>
					) : (
						<div className='bloc-tab-img' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, blockUser)}>
							<img className='image-tab-opacity' src="bloquer-un-utilisateur1.png" />
						</div>
					)
				) : (
					user.isBlocked ? (
						<div className='bloc-tab-img8' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, unblockUser)}>
							<img className='image-tab' src="bloquer-un-utilisateur1.png" />
						</div>
					) : (
						<div className='bloc-tab-img8' onClick={() => handleTabClick(`Etes vous sur de vouloir bloquer ${user.username} ?`, blockUser)}>
							<img className='image-tab-opacity' src="bloquer-un-utilisateur1.png" />
						</div>
					)
				)}
				{!all &&
					<div className='bloc-tab-img8' onClick={() => handleTabClick(`Etes vous sur de vouloir supprimer de votre liste d'amies ${user.username} ?`, removeFriends)}>
						<img className='image-tab' src="corbeille1.png"  />
					</div>
				}
			</div>
			{chatState.showConfirmation && (
				<ConfirmationComponent phrase={confirmationText} functionToExecute={funtionToExecute} />
			)}
			{chatState.showListChannelAdd && (
				<ListMyChannelComponent user={user.username} friendID={user.id} isAdd={false} title={`INVITE ${user.username} TO MY CHANNEL`} />
			)}
		</>
	);
}

export default FriendsListTabComponent;