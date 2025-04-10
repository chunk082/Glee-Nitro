import
  {
    GroupInformationComposer,
    GroupInformationEvent,
    GroupInformationParser,
    GuildForumThreadsEvent,
    GuildForumThreadsParser,
    PostMessageMessageComposer,
    PostThreadMessageEvent,
    PostThreadMessageParser
  } from "@nitrots/nitro-renderer";
import { FC, useEffect, useState } from "react";
import
  {
    AddEventLinkTracker,
    CreateLinkEvent,
    GetGroupForum,
    LocalizeText,
    RemoveLinkEventTracker,
    SendMessageComposer
  } from "../../../api";
import
  {
    Flex,
    LayoutBadgeImageView,
    NitroCardHeaderView,
    NitroCardView,
    Text
  } from "../../../common";
import { useMessageEvent } from "../../../hooks";
import { GroupForumCompose } from './GroupForumCompose';
import { GroupForumSettings } from './GroupForumSettings';

interface ForumThread {
  id: number;
  subject: string;
  postsCount: number;
  updatedAt: string;
  pinned: boolean;
  locked: boolean;
}

export const GroupForumStandaloneView: FC = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [groupInformation, setGroupInformation] = useState<GroupInformationParser | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [activeThreadData, setActiveThreadData] = useState<any | null>(null); // could be ThreadData


  // Group Info Event
  useMessageEvent(GroupInformationEvent, (event) => {
    const parser = event.parser as GroupInformationParser;
    if (!parser || parser.id !== groupId) return;

    setGroupInformation(parser);
  });

  // Threads Loaded Event (packet 509)
  useMessageEvent(GuildForumThreadsEvent, (event) => {
    const parser = event.parser as GuildForumThreadsParser;
    console.log('✅ GuildForumThreadsMessagesEvent received:', parser);

    const parsedThreads = parser.threads.map((thread: any) => ({
      id: thread.threadId,
      subject: thread.header,
      postsCount: thread.totalMessages,
      updatedAt: new Date(thread.lastCommentTime * 1000).toLocaleString(),
      pinned: thread.isPinned,
      locked: thread.isLocked
    }));

    setThreads(parsedThreads);
    console.log('[🧵 Threads Set]', parsedThreads.map(t => t.id));
    setLoading(false);
  });

  useEffect(() => {
    if (!groupId) return;
    console.log('📥 Fetching threads list for group:', groupId);
    GetGroupForum(groupId); // this triggers GuildForumThreadsEvent
  }, [groupId]);  

  // New Thread Posted Event
  useMessageEvent(PostThreadMessageEvent, (event) => {
    const parser = event.parser as PostThreadMessageParser;
    if (!parser) return;

    const newThread: ForumThread = {
      id: parser.thread.threadId,
      subject: parser.thread.header,
      postsCount: parser.thread.totalMessages,
      updatedAt: new Date(parser.thread.lastCommentTime * 1000).toLocaleString(),
      pinned: parser.thread.isPinned,
      locked: parser.thread.isLocked
    };

    setThreads(prev => [newThread, ...prev]);
    setLoading(false);
  });
  
 
  
  // Load Threads from DB
  useEffect(() => {
    const linkTracker = {
      linkReceived: (url: string) => {
        const parts = url.split("/");
        if (parts.length < 2 || parts[0] !== "group-forum") return;

        switch (parts[1]) {
          case "open":
            if (parts[2]) {
              const id = Number(parts[2]);
              console.log('Opening Group Forum UI, calling GetGroupForum()');

              setVisible(true);
              setGroupId(id);
              setLoading(true);

              SendMessageComposer(new GroupInformationComposer(id, false));
              GetGroupForum(id);
            }
            return;

          case "close":
            setVisible(false);
            setThreads([]);
            setGroupId(null);
            setGroupInformation(null);
            setLoading(true);
            return;

          case "settings":
            setShowSettings(true);
            return;
        }
      },
      eventUrlPrefix: "group-forum/"
    };

    AddEventLinkTracker(linkTracker);
    return () => RemoveLinkEventTracker(linkTracker);
  }, []);

  if (!visible || !groupId || !groupInformation) return null;

  return (
    <>
      <NitroCardView className="nitro-group-forum" theme="primary">
        <NitroCardHeaderView
          headerText={LocalizeText("group.forum.window.title")}
          onCloseClick={() => CreateLinkEvent("group-forum/close")}
        />

        <Flex className="overflow-auto flex-column container-fluid content-area nitro-group-forum-content">
          <Flex className="group-header">
            <Flex className="group-header-left">
              <Flex className="group-forum-badge">
                <LayoutBadgeImageView badgeCode={groupInformation.badge} isGroup={true} />
              </Flex>
              <Flex className="flex-column group-info" gap={0}>
                <Text variant="white" fontSize={3} bold>{groupInformation.title}</Text>
                <Text variant="white" fontSize={6}>{groupInformation.description}</Text>
              </Flex>
            </Flex>

            <Flex className="group-header-right">
              <Flex gap={1} className="group-forum-settings" onClick={() => setShowSettings(true)}>
                <div className="cursor-pointer icon-settings" />
                <div className="d-inline text-white">{LocalizeText("Settings")}</div>
              </Flex>
            </Flex>
          </Flex>

          <Flex gap={1} className="shortcuts-header">
            <span className="font-semibold mr-2 text-black">Quick Links:</span>
            <a href="#" className="text-black-600 hover:underline mr-2">My Forums</a>
            <a href="#" className="text-black-600 hover:underline mr-2">Most Active Forums</a>
            <a href="#" className="text-black-600 hover:underline">Most Viewed Forums</a>
          </Flex>

          <Flex gap={1} className="flex-column content-header">
            <div className="d-inline text-black font-bold opacity-60">{LocalizeText("group.forum.all_threads")}</div>
          </Flex>

          <Flex gap={2} className="flex-column content-wrap">
          <Flex  gap={2} className="content">
        {threads.map((thread, index) => (
      <Flex key={thread.id} className="thread">
        <Flex gap={1} className="flex-column thread-actions">
          {thread.locked && <div className="cursor-pointer icon-locked"></div>}
          {thread.pinned && <div className="cursor-pointer icon-pinned"></div>}
        </Flex>

        <Flex className="thread-without-actions">
          <Flex gap={2} className="thread-author-info flex-column">
            <div className="d-inline text-black header">{thread.subject}</div>
            <div className="d-inline text-black">{'Glee1'}</div>
            <div className="d-inline text-black">{thread.updatedAt}</div>
          </Flex>
          
          <Flex gap={2} className="thread-info flex-column">
            <div className="d-inline text-black">{thread.postsCount} mensagens</div>
            <div className="d-inline text-black">{4} visualizações</div>
          </Flex>
          </Flex>
          <Flex gap={2} className="thread-last-message-info flex-column">
            <div className="d-inline text-black header">{thread.updatedAt}</div>
            <div className="d-inline text-black">{'Glee1'}</div>
          </Flex>

          <Flex className="thread-right-side">
            <Flex className="d-flex flex-column gap-2 delete">
              <div className="cursor-pointer icon-delete"></div>
            </Flex>
            <Flex className="d-flex flex-column gap-2 report">
              <div className="cursor-pointer icon-report"></div>
            </Flex>
          </Flex>
      </Flex>
  ))}
</Flex>
</Flex>

          <Flex className="bottom align-items-center justify-content-between">
            <Flex className="align-items-center justify-content-center btn btn-muted btn-sm back-button">
              {LocalizeText("group.forum.mark_read")}
            </Flex>

            <Flex gap={1} className="right-side">
              <Flex
                className="align-items-center justify-content-center btn btn-primary btn-sm new-button"
                onClick={() => setShowCompose(true)}>
                {LocalizeText("group.forum.new_discussion")}
              </Flex>

              <Flex gap={1} className="align-items-center pagination-controls">
                <Flex className="align-items-center justify-content-center btn btn-muted btn-sm disabled">{"<<"}</Flex>
                <Flex className="align-items-center justify-content-center btn btn-muted btn-sm disabled">{"<"}</Flex>
                <div className="d-inline text-black">1 / {threads.length}</div>
                <Flex className="align-items-center justify-content-center btn btn-muted btn-sm disabled">{">"}</Flex>
                <Flex className="align-items-center justify-content-center btn btn-muted btn-sm disabled">{">>"}</Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </NitroCardView>

      {showCompose && (
        <GroupForumCompose
          groupName={groupInformation.title}
          groupDescription={groupInformation.description}
          groupBadge={groupInformation.badge}
          onClose={() => setShowCompose(false)}
          onPost={(subject, message) => {
            if (!groupId) return;
            SendMessageComposer(new PostMessageMessageComposer(groupId, 0, subject, message));
            setShowCompose(false);
          }}
        />
      )}

      {showSettings && (
        <GroupForumSettings
          onClose={() => setShowSettings(false)}
          groupInformation={groupInformation}
        />
      )}
    </>
  );
};
