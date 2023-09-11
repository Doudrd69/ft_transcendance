import RootLayout from '../layout'

export default function ComponentsLayout({ children }:	{
	children: React.ReactNode
}) {
	return (
	<RootLayout>
		<div className="LayoutMain">

			<header>
				<h1>Ft_transcendance</h1>
				<p>
					Ceci est le texte du h1 du header
				</p>
			</header>

			<section className="children">{children}</section>

			<footer>
				<p>
					Ceci est le texte du footer
				</p>
			</footer>
		</div>
	</RootLayout>
	)
}