import { GroupInformationEvent, GuildForumThreadsEvent } from '@nitrots/nitro-renderer';
import { useMessageEvent } from '../events';

export const useGroupForumManager = (
  onThreadsReceived: (groupId: number, threads: any[]) => void,
  onGroupInfoReceived: (info: any) => void
) =>
{
  useMessageEvent(GuildForumThreadsEvent, (event) =>
  {
    const parser = event.parser as any;
    console.log('[✅ Hook] GuildForumThreadsEvent received:', parser);

    if (!parser || !parser._groupId || !parser._threads) return;
    onThreadsReceived(parser._groupId, parser._threads);
  });

  useMessageEvent(GroupInformationEvent, (event) =>
  {
    const parser = event.parser as any;
    if (!parser || !parser.id) return;
    onGroupInfoReceived(parser);
  });
};
