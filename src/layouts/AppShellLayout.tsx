import { css } from '@emotion/css';
import { PropsWithChildren } from 'react';
import { Header } from 'src/components';

type Props = unknown;

/**
 * Default app shell for the app
 *
 * All routes are rendered as the children
 * to prevent re-rendering of common components like Header
 * which remain same across pages.
 *
 * By loading app-shell first and incrementally lazy loading
 * pages on demand we can reduce the user perception of TTL
 */
function AppShellLayout({ children }: PropsWithChildren<Props>) {
	return (
		<div className={container}>
			<Header />
			<div className={content}>{children}</div>
		</div>
	);
}

const container = css`
	width: 100vw;
	overflow-x: hidden;
`;
const content = css`
	padding: var(--header-h) 32px 32px;
	display: flex;
	align-items: center;
	flex-direction: column;
	height: 100vh;
`;

export default AppShellLayout;
