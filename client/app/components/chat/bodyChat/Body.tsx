import './Body.css'
import React from 'react';
import MessageComponent from './message/Message';
import DiscussionComponent from './discussion/Discussion';

const BodyComponent: React.FC = () => {

	return (
        <>
            <DiscussionComponent></DiscussionComponent>
            <MessageComponent></MessageComponent>
        </>
	)
};
export default BodyComponent;