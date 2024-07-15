import type React from "react";
import type { CSSProperties } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { type AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TreeItem, type Props as TreeItemProps } from "./TreeItem";
import { iOS } from "../../utilities";

interface Props extends TreeItemProps {
	id: UniqueIdentifier;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
	isSorting,
	wasDragging,
	// biome-ignore lint/complexity/noUselessTernary: <explanation>
}) => (isSorting || wasDragging ? false : true);

export function SortableTreeItem({ id, depth, ...props }: Props) {
	const {
		attributes,
		isDragging,
		isSorting,
		listeners,
		setDraggableNodeRef,
		setDroppableNodeRef,
		transform,
		transition,
	} = useSortable({
		id,
		animateLayoutChanges,
	});
	const style: CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<TreeItem
			ref={setDraggableNodeRef}
			wrapperRef={setDroppableNodeRef}
			style={style}
			depth={depth}
			ghost={isDragging}
			disableSelection={iOS}
			disableInteraction={isSorting}
			handleProps={{
				...attributes,
				...listeners,
			}}
			{...props}
		/>
	);
}
