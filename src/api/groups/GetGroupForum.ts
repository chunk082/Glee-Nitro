import { GetForumsListMessageComposer } from '@nitrots/nitro-renderer';
import { SendMessageComposer } from '..';

export function GetGroupForum(groupId: number): void
{
    const offset = 0;
    
    console.log(`Sending request to open forum for Group ID: ${groupId}`);
    SendMessageComposer(new GetForumsListMessageComposer(groupId, offset, 100)); // Request forum threads
}
