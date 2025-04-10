import { GroupInformationParser } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { LocalizeText } from '../../../api';
import
  {
    Flex,
    LayoutBadgeImageView,
    NitroCardContentView,
    NitroCardHeaderView,
    NitroCardView,
    Text
  } from '../../../common';

interface GroupForumSettingsProps {
  onClose: () => void;
  groupInformation: GroupInformationParser;
}

export const GroupForumSettings: FC<GroupForumSettingsProps> = ({ onClose, groupInformation }) => {
  return (
    <NitroCardView className="nitro-group-forum-settings" theme="primary">
      <NitroCardHeaderView
        headerText={LocalizeText('group.forum.settings.title')}
        onCloseClick={onClose}
      />

      {/* Correct structure begins here */}
      <NitroCardContentView className="nitro-group-forum-settings-content">
          {/* Group Header (badge, title, desc) */}
          <Flex className="group-header">
            <Flex className="group-forum-badge">
              <LayoutBadgeImageView badgeCode={groupInformation.badge} isGroup={true} />
            </Flex>
            <Flex gap={2} className="flex-column group-info">
              <Text variant="white" fontSize={4} bold>{groupInformation.title}</Text>
              <Text variant="white" fontSize={6}>{groupInformation.description}</Text>
            </Flex>
          </Flex>

          {/* Content section (Settings UI goes here) */}
<Flex className="h-100 flex-column gap-3 content">
  
  {/* Who can read the forum */}
  <Flex className="flex-column gap-2">
    <div className="d-inline text-black">{LocalizeText('group.forum.settings.whocan.read')}</div>
    <Flex gap={1} className="flex-column options">
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="readPermission" id="readPermission1" defaultChecked />
        <div className="d-inline text-black">Everybody</div>
      </Flex>
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="readPermission" id="readPermission2" />
        <div className="d-inline text-black">Only group members</div>
      </Flex>
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="readPermission" id="readPermission3" />
        <div className="d-inline text-black">Only group administrators</div>
      </Flex>
    </Flex>
  </Flex>

  {/* Who can post messages */}
  <Flex className="flex-column gap-2">
    <div className="d-inline text-black">{LocalizeText('group.forum.settings.whocan.post')}</div>
    <Flex gap={1} className="flex-column options">
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="postPermission" id="postPermission1" defaultChecked />
        <div className="d-inline text-black">Everybody</div>
      </Flex>
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="postPermission" id="postPermission2" />
        <div className="d-inline text-black">Only group members</div>
      </Flex>
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="postPermission" id="postPermission3" />
        <div className="d-inline text-black">Only group administrators</div>
      </Flex>
      <Flex gap={1} alignItems="center">
        <input className="form-check-input" type="radio" name="postPermission" id="postPermission4" />
        <div className="d-inline text-black">Only me</div>
      </Flex>
    </Flex>
  </Flex>
  {/* Who can start new threads */}
<Flex className="flex-column gap-2">
  <div className="d-inline text-black">{LocalizeText('group.forum.settings.whocan.start')}</div>
  <Flex gap={1} className="flex-column options">
    <Flex gap={1} alignItems="center">
      <input className="form-check-input" type="radio" name="startThreadPermission" id="startThreadPermission2" />
      <div className="d-inline text-black">Only group members</div>
    </Flex>
    <Flex gap={1} alignItems="center">
      <input className="form-check-input" type="radio" name="startThreadPermission" id="startThreadPermission3" />
      <div className="d-inline text-black">Only group administrators</div>
    </Flex>
    <Flex gap={1} alignItems="center">
      <input className="form-check-input" type="radio" name="startThreadPermission" id="startThreadPermission4" />
      <div className="d-inline text-black">Only me</div>
    </Flex>
  </Flex>
</Flex>

{/* Who can moderate (delete, lock, pin) */}
<Flex className="flex-column gap-2">
  <div className="d-inline text-black">{LocalizeText('group.forum.settings.whocan.moderate')}</div>
  <Flex gap={1} className="flex-column options">
    <Flex gap={1} alignItems="center">
      <input className="form-check-input" type="radio" name="moderatePermission" id="moderatePermission3" />
      <div className="d-inline text-black">Only group administrators</div>
    </Flex>
    <Flex gap={1} alignItems="center">
      <input className="form-check-input" type="radio" name="moderatePermission" id="moderatePermission4" />
      <div className="d-inline text-black">Only me</div>
    </Flex>
  </Flex>
</Flex>
</Flex>

          {/* Bottom bar (optional controls or save/cancel) */}
<Flex className="bottom" gap={1}>
  <Flex className="align-items-center justify-content-center btn btn-muted btn-sm button" onClick={onClose}>
    Cancel
  </Flex>
  <Flex className="align-items-center justify-content-center btn btn-primary btn-sm button">
    OK
  </Flex>
</Flex>

        
      </NitroCardContentView>
    </NitroCardView>
  );
};
