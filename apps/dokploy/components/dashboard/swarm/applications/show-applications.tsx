import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import { Layers, LoaderIcon } from "lucide-react";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface Props {
	nodeName: string;
}

interface ApplicationList {
	ID: string;
	Image: string;
	Mode: string;
	Name: string;
	Ports: string;
	Replicas: string;
	CurrentState: string;
	DesiredState: string;
	Error: string;
	Node: string;
}

const ShowNodeApplications = ({ nodeName }: Props) => {
	const [loading, setLoading] = React.useState(true);
	const { data: NodeApps, isLoading: NodeAppsLoading } =
		api.swarm.getNodeApps.useQuery();

	let applicationList = "";

	if (NodeApps && NodeApps.length > 0) {
		applicationList = NodeApps.map((app) => app.Name).join(" ");
	}

	const { data: NodeAppDetails, isLoading: NodeAppDetailsLoading } =
		api.swarm.getAppInfos.useQuery({ appName: applicationList });

	if (NodeAppsLoading || NodeAppDetailsLoading) {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm" className="w-full">
						<LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
					</Button>
				</DialogTrigger>
			</Dialog>
		);
	}

	if (!NodeApps || !NodeAppDetails) {
		return <div>No data found</div>;
	}

	const combinedData: ApplicationList[] = NodeApps.flatMap((app) => {
		const appDetails =
			NodeAppDetails?.filter((detail) =>
				detail.Name.startsWith(`${app.Name}.`),
			) || [];

		if (appDetails.length === 0) {
			return [
				{
					...app,
					CurrentState: "N/A",
					DesiredState: "N/A",
					Error: "",
					Node: "N/A",
					Ports: app.Ports,
				},
			];
		}

		return appDetails.map((detail) => ({
			...app,
			CurrentState: detail.CurrentState,
			DesiredState: detail.DesiredState,
			Error: detail.Error,
			Node: detail.Node,
			Ports: detail.Ports || app.Ports,
		}));
	});

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					<Layers className="h-4 w-4 mr-2" />
					Services
				</Button>
			</DialogTrigger>
			<DialogContent className={"sm:max-w-5xl overflow-y-auto max-h-screen"}>
				<DialogHeader>
					<DialogTitle>Node Applications</DialogTitle>
					<DialogDescription>
						See in detail the applications running on this node
					</DialogDescription>
				</DialogHeader>
				<div className="max-h-[90vh]">
					<DataTable columns={columns} data={combinedData ?? []} />
				</div>
				{/* <div className="text-wrap rounded-lg border p-4 text-sm sm:max-w-[59rem] bg-card max-h-[70vh] overflow-auto"></div> */}
			</DialogContent>
		</Dialog>
	);
};

export default ShowNodeApplications;
