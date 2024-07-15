// src/DnDExample.tsx
import type React from "react";
import { useState } from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "react-beautiful-dnd";

type Field = {
	id: string;
	content: string;
	index?: number;
};
type Section = {
	id: string;
	index?: number;
	content: string;
	items: Item[];
};
type Item = Field | Section;

const initialItems: Item[] = [
	{ id: "item-1", content: "Item 1" },
	{ id: "item-2", content: "Item 2" },
	{ id: "item-3", content: "Item 3" },
	{
		id: "section-1",
		content: "Section 1",
		items: [
			{ id: "item-5", content: "Item 5" },
			{ id: "item-6", content: "Item 6" },
		],
	},
	{
		id: "section-2",
		content: "Section 2",
		items: [
			{ id: "item-8", content: "Item 8" },
			{ id: "item-9", content: "Item 9" },
		],
	},
	{ id: "item-7", content: "Item 7" },
];

type FieldProps = {
	index: number;
	field: Field;
};

const FieldComponent = (props: FieldProps) => {
	const { index, field } = props;
	return (
		<Draggable key={field.id} draggableId={field.id} index={index}>
			{(provided) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					style={{
						userSelect: "none",
						padding: "16px",
						margin: "4px 0",
						border: "1px solid lightgrey",
						borderRadius: "4px",
						backgroundColor: "white",
						...provided.draggableProps.style,
					}}
				>
					{field.content}
				</div>
			)}
		</Draggable>
	);
};

type SectionProps = {
	index: number;
	section: Section;
};

const SectionComponent = (props: SectionProps) => {
	const { index, section } = props;
	return (
		<Draggable key={section.id} draggableId={section.id} index={index}>
			{(provided) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					style={{
						userSelect: "none",
						padding: "16px",
						margin: "4px 0",
						border: "1px solid lightgrey",
						borderRadius: "4px",
						backgroundColor: "white",
						...provided.draggableProps.style,
					}}
				>
					<div>{section.content}</div>
					<Droppable droppableId={section.id} type="section">
						{(provided, snapshot) => (
							<div
								ref={provided.innerRef}
								{...provided.droppableProps}
								style={{
									margin: "8px 0",
									background: snapshot.isDraggingOver
										? "lightblue"
										: "lightgrey",
								}}
							>
								{section.items.map((field, fieldIndex) => (
									<FieldComponent
										key={field.id}
										index={fieldIndex}
										field={field}
									/>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</div>
			)}
		</Draggable>
	);
};

const DnD: React.FC = () => {
	const [items, setItems] = useState(initialItems);

	const moveAmongBase = (result: DropResult) => {
		const { source, destination, type } = result;
		const newItems = Array.from(items);
		const [removed] = newItems.splice(source.index, 1);
		newItems.splice(destination!.index, 0, removed);
		setItems(newItems);
	};
	const moveWithinSection = (result: DropResult, sectionIndex: number) => {
		const { source, destination } = result;
		const section = items[sectionIndex] as Section;
		const newItems = Array.from(section.items);
		const [removed] = newItems.splice(source.index, 1);
		newItems.splice(destination!.index, 0, removed);
		const newSections = Array.from(items);
		newSections[sectionIndex] = { ...section, items: newItems };
		setItems(newSections);
	};
	const moveBetweenSections = (
		result: DropResult,
		srcSectionIndex: number,
		dstSectionIndex: number,
	) => {
		const { source, destination, type } = result;
		const sourceSection = items[srcSectionIndex] as Section;
		const destinationSection = items[dstSectionIndex] as Section;

		const sourceItems = Array.from(sourceSection.items);
		const [removed] = sourceItems.splice(source.index, 1);
		const destinationItems = Array.from(destinationSection.items);
		destinationItems.splice(destination!.index, 0, removed);

		const newSections = Array.from(items);
		newSections[srcSectionIndex] = { ...sourceSection, items: sourceItems };
		newSections[dstSectionIndex] = {
			...destinationSection,
			items: destinationItems,
		};
		setItems(newSections);
	};
	const moveSectionToBase = (result: DropResult, srcSectionIndex: number) => {
		const { source, destination, type } = result;
		const sourceSection = items[srcSectionIndex] as Section;

		const sourceItems = Array.from(sourceSection.items);
		const [removed] = sourceItems.splice(source.index, 1);

		const newItems = Array.from(items);
		newItems.splice(destination!.index, 0, removed);
		newItems[srcSectionIndex] = { ...sourceSection, items: sourceItems };
		setItems(newItems);
	};
	const moveBaseToSection = (result: DropResult, dstSectionIndex: number) => {
		const { source, destination, type } = result;
		const destinationSection = items[dstSectionIndex] as Section;

		const newItems = Array.from(items);
		const [removed] = newItems.splice(source.index, 1);

		const destinationItems = Array.from(destinationSection.items);
		destinationItems.splice(destination!.index, 0, removed);

		newItems[dstSectionIndex] = {
			...destinationSection,
			items: destinationItems,
		};
		setItems(newItems);
	};

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const { source, destination, type } = result;

		if (type === "base") {
			moveAmongBase(result);
		} else {
			const sourceSectionIndex = items.findIndex(
				(item) => "items" in item && item.id === source.droppableId,
			);
			const destinationSectionIndex = items.findIndex(
				(item) => "items" in item && item.id === destination.droppableId,
			);

			if (sourceSectionIndex >= 0 && destinationSectionIndex >= 0) {
				if (sourceSectionIndex === destinationSectionIndex) {
					moveWithinSection(result, sourceSectionIndex);
				} else {
					moveBetweenSections(
						result,
						sourceSectionIndex,
						destinationSectionIndex,
					);
				}
			} else if (sourceSectionIndex >= 0) {
				moveSectionToBase(result, sourceSectionIndex);
			} else if (destinationSectionIndex >= 0) {
				moveBaseToSection(result, destinationSectionIndex);
			}
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable" type="base">
				{(provided) => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
						style={{
							padding: "8px",
							width: "250px",
							border: "1px solid lightgrey",
						}}
					>
						{items.map((item, index) => {
							if ("items" in item) {
								const section = {
									...item,
									items: item.items.map((entry, fieldIndex) => {
										return {
											...entry,
											index: fieldIndex,
										};
									}),
								};
								return <SectionComponent index={index} section={section} />;
							}
							return (
								<FieldComponent
									key={item.id}
									index={index}
									field={item as Field}
								/>
							);
						})}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default DnD;
