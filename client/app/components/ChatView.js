const ChatView = () => {
	return (
		<div className="ChatPage">
			<h1>Ceci est le ChatView!</h1>

			<div className="MessageList">
				<p>
					on affichera ici la liste des messages
				</p>
			</div>

			<form>
				<input type="text" placeholder="Message..."></input>
				<button>Envoyer</button>
			</form>

		</div>
	)
};

	export default ChatView;