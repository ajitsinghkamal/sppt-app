import { useCallback, useEffect, useState } from 'react';

import { PageLayout } from 'src/layouts';
import { useEventList } from 'src/apis/ApiEvents';
import { EventList, EventDatePicker } from 'src/components';

import { css } from '@emotion/css';

type State = {
	startDate?: string;
	endDate?: string;
};

function EventsPage() {
	const { response, status, request, error, dispatch } = useEventList({
		dependencies: [],
		params: {
			limit: 10,
		},
	});

	const items = response?.items || [];
	const pagination = response?.pagination;

	const [selectedDates, setDates] = useState<State>({
		startDate: undefined,
		endDate: undefined,
	});

	/**
	 * prepares params and makes request for event filtering or
	 * subsequent fetching
	 *
	 * @param params
	 * startDate: start filter
	 * endDate: end filter
	 * offset: request next set of data from the offset
	 * noAutoUpdate: used for pagination
	 */
	const shouldFetchEvents = async (
		params: State & { offset?: number; noAutoUpdate?: boolean }
	) => {
		try {
			const data = await request(
				{
					params: {
						limit: 10,
						offset: params.offset,
						startsAt: params.startDate,
						endsAt: params.endDate,
					},
				},
				!!params.noAutoUpdate
			);

			if (params.noAutoUpdate && data) {
				dispatch({
					type: 'update',
					payload: {
						response: {
							items: [...items, ...data.items],
							pagination: data.pagination,
						},
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const shouldFilterByDate = () => {
		if (!selectedDates.startDate && !selectedDates.endDate) {
			// reset filter when both start and end cleared
			shouldFetchEvents({});
		}
		if (selectedDates.startDate && selectedDates.endDate) {
			// filter when both start and end present
			shouldFetchEvents(selectedDates);
		}
	};

	const handleDateSelect = useCallback(
		(key, selection) => {
			setDates({
				...selectedDates,
				[key]: selection,
			});
		},
		[selectedDates, setDates]
	);

	const resetDateSelect = useCallback(() => {
		setDates({
			startDate: undefined,
			endDate: undefined,
		});
	}, []);

	const handleLoadMore = useCallback(() => {
		if (pagination) {
			const { offset, limit, count } = pagination;
			const next = offset + limit;
			next < count &&
				shouldFetchEvents({
					offset: next,
					noAutoUpdate: true,
				});
		}
	}, [pagination]);

	useEffect(() => {
		shouldFilterByDate();
	}, [selectedDates.startDate, selectedDates.endDate]);

	return (
		<PageLayout>
			<h1 className={page__title}>All Events</h1>
			<div className={filterbar}>
				{error ? (
					<p>Something went wrong</p>
				) : response ? (
					<p className={filterbar__meta}>
						Showing<span>{items.length}</span>of
						<span>{pagination?.count}</span>
					</p>
				) : (
					<p>Getting Events...</p>
				)}
				<EventDatePicker
					onSelect={handleDateSelect}
					onReset={resetDateSelect}
					startDate={selectedDates.startDate}
					endDate={selectedDates.endDate}
				/>
			</div>
			<EventList
				loading={status === 'WAITING'}
				list={items}
				pagination={pagination}
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
	z-index: 10;
	flex-flow: row wrap;
	box-shadow: 0 0 0 10px var(--white400);
`;

const filterbar__meta = css`
	font-weight: 300;
	opacity: 0.8;
	margin-right: 12px;
	& > span {
		margin: 0 5px;
		font-weight: 400;
	}
`;
export default EventsPage;
