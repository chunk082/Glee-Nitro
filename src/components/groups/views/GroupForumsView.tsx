import
  {
    ForumDataMessageEvent,
    GetForumsListMessageComposer,
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
    GetSessionDataManager,
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

function formatSecondsAgo(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(seconds / 86400);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

interface ForumThread {
  id: number;
  subject: string;
  postsCount: number;
  creationTimeAsSecondsAgo: number;
  updatedAt: string;
  pinned: boolean;
  locked: boolean;
  //openerId: number;
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
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [currentView, setCurrentView] = useState<'all_threads' | 'my_forums' | 'most_active' | 'most_viewed'>('all_threads');
  const [myForums, setMyForums] = useState<any[]>([]);
  const [mostActive, setMostActive] = useState<any[]>([]);
  const [viewingForum, setViewingForum] = useState<any | null>(null);
  const [selectedForum, setSelectedForum] = useState(null);
  const handleOpenForum = (forum: any) => {
    setViewingForum(forum); // 🆕 Show the forum in dedicated view
    setGroupId(forum.id);
    setSelectedForum(forum);
    setCurrentView('all_threads');
    setVisible(true);
  
    SendMessageComposer(new GroupInformationComposer(forum.id, false));
    GetGroupForum(forum.id);
  };
  
  
  const headerConfig = {
    my_forums: {
      icon: 'icon-code-2', // replace with actual icon class if needed
      title: 'My Forums'
    },
    most_active: {
      icon: 'icon-code-0', // replace with correct icon class
      title: 'Most Active Forums'
    },
    most_viewed: {
      icon: 'icon-code-1', // replace with correct icon class
      title: 'Most Viewed Forums'
    }
  };
  
  const currentHeader = headerConfig[currentView] ?? {
    icon: 'icon-code-2',
    title: 'My Forums'
  }; 
  
  // Group Info Event
  useMessageEvent(GroupInformationEvent, (event) => {
    const parser = event.parser as GroupInformationParser;
    if (!parser || parser.id !== groupId) return;

    setGroupInformation(parser);
  });
  
  useEffect(() => {
    if (currentView === 'my_forums') {
      setLoading(true);
      console.log('📥 Sending GetForumsListComposer...');
      SendMessageComposer(new GetForumsListMessageComposer(GetSessionDataManager().userId, 2, 50));
    }
  }, [currentView]);

  // Threads Loaded Event (packet 509) <- This is the Threads... Not for the Forum Group.
  useMessageEvent(GuildForumThreadsEvent, (event) => {
    const parser = event.parser as GuildForumThreadsParser;
  
    if (!parser || !parser.threads) return;
  
    console.log('✅ GuildForumThreadsEvent fired:', parser.threads);
  
    const parsedThreads = parser.threads.map((thread: any) => ({
      id: thread.threadId,
      subject: thread.header,
      postsCount: thread.totalMessages,
      creationTimeAsSecondsAgo: thread.creationTimeAsSecondsAgo,
      updatedAt: new Date(thread.lastCommentTime * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }),    
      pinned: thread.isPinned,
      locked: thread.isLocked,
      //openerId: thread.openerId
    }));
  
    setThreads(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newUniqueThreads = parsedThreads.filter(t => !existingIds.has(t.id));
      return [...prev, ...newUniqueThreads];
    });    

  });

  // This should be to pulling the Groups Information... Or I might be missing additional data...
  useMessageEvent(ForumDataMessageEvent, event => {
    const parser = event.parser as any;
  
    if (!parser || !parser._extendedForumData) return;
  
    console.log('📥 Received Forum Data:', parser);
  
    const data = parser._extendedForumData;
  
    const forumInfo = {
      id: data.groupId,
      name: data.name,
      badge: data.icon,
      topics: data.totalThreads,
      messages: data.totalMessages,
      unread: data.unreadMessages,
      lastMessageUser: data.lastPosterName,
      lastMessageTime: data.lastPostTimeAgo
    };
  
    console.log('✅ Parsed Forum Info:', forumInfo);
    setMyForums([forumInfo]);
  }); 

  // New Thread Posted Event
  useMessageEvent(PostThreadMessageEvent, (event) => {
    const parser = event.parser as PostThreadMessageParser;
    if (!parser) return;

    const newThread: ForumThread = {
      id: parser.thread.threadId,
      subject: parser.thread.header,
      postsCount: parser.thread.totalMessages,
      creationTimeAsSecondsAgo: parser.thread.creationTimeAsSecondsAgo,
      updatedAt: new Date(parser.thread.lastCommentTime * 1000).toLocaleString(),
      pinned: parser.thread.isPinned,
      locked: parser.thread.isLocked,

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
              setViewingForum(null);

              SendMessageComposer(new GroupInformationComposer(id, false));
              GetGroupForum(id);
            }
            return;
          
          case "close":
            setVisible(false);
            setThreads([]);
            setGroupId(null);
            setViewingForum(null);
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
      {viewingForum && currentView === 'all_threads' ? (
        <LayoutBadgeImageView badgeCode={viewingForum.badge} isGroup={true} />
      ) : (
        <div className={currentHeader.icon}></div>
      )}
    </Flex>
    <Flex className="flex-column group-info" gap={0}>
      <Text variant="white" fontSize={3} bold>
        {viewingForum && currentView === 'all_threads'
          ? groupInformation?.title ?? 'Forum'
          : currentHeader.title}
      </Text>
      {viewingForum && currentView === 'all_threads' && groupInformation?.description && (
        <Text variant="white" fontSize={6}>
          {groupInformation.description}
        </Text>
      )}
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
            <div
  className="d-inline text-black shortcuts-option cursor-pointer"
  onClick={() => setCurrentView('my_forums')}>
  My Forums
</div>

<div
  className="d-inline text-black shortcuts-option cursor-pointer"
  onClick={() => setCurrentView('most_active')}>
  Most Active Forums
</div>

<div
  className="d-inline text-black shortcuts-option cursor-pointer"
  onClick={() => setCurrentView('most_viewed')}>
  Most Viewed Forums
</div>

          </Flex>

       {/* Only show My Forums when NOT viewing a specific forum */}
       {!viewingForum && currentView === 'my_forums' && (
  <>
    <Flex gap={1} className="flex-column content-header">
      <div className="d-inline text-black">{LocalizeText("group.forum.my_forums")}</div>
    </Flex>
    <Flex gap={2} className="flex-column content-wrap">
      <Flex gap={2} className="flex-column content">
        {myForums.length === 0 && (
          <div className="text-black p-2">No forums available for your user.</div>
        )}
        {myForums.map(forum => (
          <Flex
            key={forum.id}
            className="group"
            onDoubleClick={() => handleOpenForum(forum)}>
            <Flex gap={2} className="flex-column">
              <div className="badge-image group-badge group-badge">
                <LayoutBadgeImageView badgeCode={forum.badge} isGroup={true} />
              </div>
            </Flex>
            <Flex gap={2} className="flex-column group-info">
              <div className="d-inline text-black header">{forum.name}</div>
            </Flex>
            <Flex gap={2} className="flex-column threads-info">
              <div className="d-inline text-black">
                {forum.topics} {LocalizeText("group.forum.topics")}
              </div>
              <div className="d-inline text-black">
                {forum.messages} {LocalizeText("group.forum.messages")}
              </div>
            </Flex>
            <Flex gap={2} className="flex-column threads-last-message-info">
              <div className="d-inline text-black header">{forum.lastMessageTime}</div>
              <div className="d-inline text-black">{forum.lastMessageUser}</div>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  </>
)}
{/* End My Forum Area */}

{/* Thread View */}
{viewingForum && currentView === 'all_threads' && selectedForum && (

  <>
    <Flex gap={1} className="flex-column content-header">
      <div className="d-inline text-black font-bold opacity-60">
        {LocalizeText("group.forum.all_threads")}
      </div>
    </Flex>

    <Flex gap={2} className="flex-column content-wrap">
      <Flex gap={2} className="flex-column content">
      {threads.map((thread, index) => (
  <Flex
    key={thread.id}
    className="thread"
    onDoubleClick={() => {
      setActiveThreadId(thread.id);
      setActiveThreadData(thread);
    }}
  >

            <Flex gap={1} className="flex-column thread-actions">
              <div
                title={thread.locked ? "Locked" : "Unlocked"}
                className={`cursor-pointer ${thread.locked ? 'icon-locked' : 'icon-unlocked'}`}
              />
              <div
                title={thread.pinned ? "Pinned" : "Unpinned"}
                className={`cursor-pointer ${thread.pinned ? 'icon-pinned' : 'icon-unpinned'}`}
              />
            </Flex>

            <Flex className="thread-without-actions">
              <Flex gap={2} className="flex-column thread-author-info">
                <div className="d-inline text-black header">{thread.subject}</div>
                <div className="d-inline text-black">
                  · {formatSecondsAgo(thread.creationTimeAsSecondsAgo)}
                </div>
              </Flex>

              <Flex gap={2} className="flex-column thread-info">
                <div className="d-inline text-black">
                  {thread.postsCount} {LocalizeText("group.forum.postcount")}
                </div>
                <div className="d-inline text-black">
                  4 {LocalizeText("group.forum.visitors")}
                </div>
              </Flex>
            </Flex>

            <Flex gap={2} className="flex-column thread-last-message-info">
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
  </>
)}
{/* End of the thread area */}

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
