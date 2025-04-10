import { FC, useState } from 'react';
import { LocalizeText } from '../../../api';
import { Flex, LayoutBadgeImageView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../common';

interface GroupForumComposeProps {
  groupName: string;
  groupDescription: string;
  groupBadge: string;
  onClose: () => void;
  onPost: (subject: string, message: string) => void;
}

export const GroupForumCompose: FC<GroupForumComposeProps> = ({ groupName, groupDescription, groupBadge, onClose, onPost }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handlePost = () => {
    if(subject.length < 10) return alert('Subject must be at least 10 characters.');
    if(message.length < 1) return alert('Message cannot be empty.');
    
    onPost(subject, message);
  };

  return (
    <NitroCardView className="nitro-group-forum-new" theme="primary">
      <NitroCardHeaderView
        headerText={LocalizeText("group.forum.compose.title")}
        onCloseClick={onClose}
      />

      <NitroCardContentView className="d-flex overflow-auto flex-column container-fluid content-area nitro-group-forum-new-content">
        {/* Group Header */}
        <Flex className="group-header">
          <Flex className="group-forum-badge">
            <LayoutBadgeImageView badgeCode={groupBadge} isGroup={true} />
          </Flex>
          <Flex className="flex-column group-info" gap={0}>
            <Text variant="white" fontSize={3} bold>{groupName}</Text>
            <Text variant="white" fontSize={6}>{groupDescription}</Text>
          </Flex>
        </Flex>

        {/* Form Inputs */}
        <Flex gap={2} className="h-100 flex-column">
          {/* Subject */}
          <Flex className="flex-column thread-subject">
            <Flex className="thread-subject-header">
              <div className="d-flex text-white">{LocalizeText('group.forum.compose.subject')}</div>
            </Flex>
            <Flex className="thread-subject-content">
              <input
                type="text"
                className="form-control form-control-sm"
                maxLength={100}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </Flex>
          </Flex>

          {/* Message */}
          <Flex className="h-100 flex-column thread-subject">
            <Flex className="thread-subject-header justify-between">
              <div className="d-inline text-white">{LocalizeText('group.forum.compose.message')}</div>
              <div className="d-inline text-white formatting-help">{LocalizeText("group.forum.compose.formatting_help")}</div>
            </Flex>
            <Flex className="h-100 thread-subject-content">
              <textarea
                className="flex-grow-1 form-control form-control-sm w-100"
                maxLength={4000}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </Flex>
          </Flex>
        </Flex>
      </NitroCardContentView>

      {/* Bottom Buttons */}
      <Flex className="bottom justify-between">
        <div className="btn btn-muted btn-sm" onClick={onClose}>{LocalizeText('group.forum.compose.cancel')}</div>
        <div className="btn btn-primary btn-sm" onClick={handlePost}>{LocalizeText('group.forum.compose.post')}</div>
      </Flex>
    </NitroCardView>
  );
};
