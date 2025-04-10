import { FriendlyTime, HabboClubLevelEnum } from '@nitrots/nitro-renderer';
import { FC, useMemo } from 'react';
import { CreateLinkEvent, GetConfiguration, LocalizeText } from '../../api';
import { Column, Flex, Grid, LayoutCurrencyIcon } from '../../common';
import { usePurse } from '../../hooks';
import { CurrencyView } from './views/CurrencyView';
import { SeasonalView } from './views/SeasonalView';

export const PurseView: FC<{}> = props =>
{
    const { purse = null, hcDisabled = false } = usePurse();

    const displayedCurrencies = useMemo(() => GetConfiguration<number[]>('system.currency.types', []), []);
    const currencyDisplayNumberShort = useMemo(() => GetConfiguration<boolean>('currency.display.number.short', false), []);

    const getClubText = (() =>
    {
        if(!purse) return null;

        const totalDays = ((purse.clubPeriods * 31) + purse.clubDays);
        const minutesUntilExpiration = purse.minutesUntilExpiration;

        if(purse.clubLevel === HabboClubLevelEnum.NO_CLUB) return LocalizeText('purse.clubdays.zero.amount.text');

        else if((minutesUntilExpiration > -1) && (minutesUntilExpiration < (60 * 24))) return FriendlyTime.shortFormat(minutesUntilExpiration * 60);
        
        else return FriendlyTime.shortFormat(totalDays * 86400);
    })();

    const getCurrencyElements = (offset: number, limit: number = -1, seasonal: boolean = false) =>
    {
        if(!purse || !purse.activityPoints || !purse.activityPoints.size) return null;

        const types = Array.from(purse.activityPoints.keys()).filter(type => (displayedCurrencies.indexOf(type) >= 0));

        let count = 0;

        while(count < offset)
        {
            types.shift();

            count++;
        }

        count = 0;

        const elements: JSX.Element[] = [];

        for(const type of types)
        {
            if((limit > -1) && (count === limit)) break;

            if(seasonal) elements.push(<SeasonalView key={ type } type={ type } amount={ purse.activityPoints.get(type) } />);
            else elements.push(<CurrencyView key={ type } type={ type } amount={ purse.activityPoints.get(type) } short={ currencyDisplayNumberShort } />);

            count++;
        }

        return elements;
    }

    if(!purse) return null;

    return (
        <Column className="nitro-purse-container" gap={ 1 }>
            <Flex className="nitro-purse rounded-bottom p-1 w-100">
                <Grid fullWidth gap={ 1 }>
                    <Column justifyContent="center" size={ hcDisabled ? 8 : 6 } gap={ 1 }>
                        <CurrencyView type={ -1 } amount={ purse.credits } short={ currencyDisplayNumberShort } />
                        { getCurrencyElements(0, 2) }
                    </Column>
                    { !hcDisabled &&
                        <Column center pointer size={ 3 } gap={ 1 } className="nitro-purse-subscription rounded" onClick={ event => CreateLinkEvent('habboUI/open/hccenter') }>
                            <LayoutCurrencyIcon className="club-text" type="hc" />
                            <span>{ getClubText }</span>
                        </Column> }
                    <Column justifyContent="center" size={ 3 } gap= { 0 }>
                        <Flex className="cursor-pointer align-items-center justify-content-center test-btn help" onClick={ event => CreateLinkEvent('help/show') }>
                            <span>{ LocalizeText('help.button.cfh') }</span>
                        </Flex>
                        <Flex className="cursor-pointer align-items-center justify-content-center test-btn logout" onClick={ event => CreateLinkEvent('disconnect') }>
                            <i className="icon icon-exit"/>
                        </Flex>
                        <Flex className="cursor-pointer align-items-center justify-content-center test-btn settings" onClick={ event => CreateLinkEvent('user-settings/toggle') } >
                            <i className="icon icon-gear"/>
                        </Flex>
                    </Column>
                </Grid>
            </Flex>
            { getCurrencyElements(2, -1, true) }
        </Column>
    );
}
