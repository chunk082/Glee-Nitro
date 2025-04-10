import { FC } from 'react';
import { LocalizeFormattedNumber, LocalizeText } from '../../../api';
import { Flex, LayoutCurrencyIcon } from '../../../common';

interface SeasonalViewProps
{
    type: number;
    amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props =>
{
    const { type = -1, amount = -1 } = props;

    return (
        <Flex fullWidth justifyContent="between" className={`nitro-purse-seasonal-currency px-2 py-1 rounded currency-type-${type}`}>
            <span className="text">{ LocalizeText(`purse.seasonal.currency.${ type }`) }</span>
            <Flex gap={ 1 }>
                <span>{ LocalizeFormattedNumber(amount) }</span>
                <LayoutCurrencyIcon type={ type } />
            </Flex>
        </Flex>
    );
}
