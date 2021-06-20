import { useCallback, useEffect, useState } from 'react';

import { PageLayout } from 'src/layouts';
import { useEventList } from 'src/apis/ApiEvents';
import { EventList, EventDatePicker } from 'src/components';
import type { EventDatePickerProps } from 'src/components';

import { css } from '@emotion/css';
import { formatISO } from 'date-fns';

type State = {
	startDate?: Date;
	endDate?: Date;
};
function HomePage() {
	const { response, status, request, dispatch } = useEventList({
		dependencies: [],
	});
	const [selectedDates, setDates] = useState<State>({
		startDate: undefined,
		endDate: undefined,
	});

	const shouldFetchEvents = async (
		params: State & { offset?: number; noAutoUpdate?: boolean }
	) => {
		try {
			const data = await request(
				{
					params: {
						offset: params.offset,
						startsAt:
							params.startDate && formatISO(params.startDate),
						endsAt: params.endDate && formatISO(params.endDate),
					},
				},
				!!params.noAutoUpdate
			);
			if (params.noAutoUpdate && data) {
				const existingItems = response?.items || [];
				dispatch({
					type: 'update',
					payload: {
						response: {
							items: [...existingItems, ...data.items],
							pagination: data.pagination,
						},
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleDateSelect = useCallback<EventDatePickerProps['onSelect']>(
		(key, selection) => {
			setDates({
				...selectedDates,
				[key]: selection,
			});
		},
		[selectedDates, setDates]
	);

	const handleLoadMore = useCallback(() => {
		if (response && response.pagination) {
			const { offset, limit, count } = response.pagination;
			const next = offset + limit;
			next < count &&
				shouldFetchEvents({
					offset: next,
					noAutoUpdate: true,
				});
		}
	}, [response?.pagination]);

	useEffect(() => {
		if (!selectedDates.startDate && !selectedDates.endDate) {
			// reset filter when both start and end cleared
			shouldFetchEvents({});
		}
		if (selectedDates.startDate && selectedDates.endDate) {
			// filter when both start and end present
			shouldFetchEvents(selectedDates);
		}
	}, [selectedDates.startDate, selectedDates.endDate]);

	return (
		<PageLayout>
			<h1 className={page__title}>All Events</h1>
			<div className={filterbar}>
				{response ? (
					<p className={filterbar__meta}>
						Showing<span>{response.items.length}</span>of
						<span>{response.pagination.count}</span>
					</p>
				) : (
					<span>Loading...</span>
				)}
				<EventDatePicker
					onSelect={handleDateSelect}
					startDate={selectedDates.startDate}
					endDate={selectedDates.endDate}
				/>
			</div>
			<EventList
				loading={status === 'WAITING'}
				list={response?.items}
				pagination={response?.pagination}
				onNext={handleLoadMore}
			/>
		</PageLayout>
	);
}

const page__title = css`
	margin-top: 32px;
`;
const filterbar = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: sticky;
	background: var(--white400);
	top: var(--header-h);
	padding: 6px 0;
	box-shadow: 0 0 0 10px var(--white400);
`;

const filterbar__meta = css`
	font-weight: 300;
	opacity: 0.8;
	& > span {
		margin: 0 5px;
		font-weight: 400;
	}
`;
export default HomePage;