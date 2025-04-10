import { GetThreadsMessageComposer } from '@nitrots/nitro-renderer';
import { SendMessageComposer } from '..';

export function GetGroupForum(groupId: number): void
{
    console.log(`Sending request to open forum for Group ID: ${groupId}`);
    SendMessageComposer(new GetThreadsMessageComposer(groupId, 0, 20)); // Request forum threads
}
