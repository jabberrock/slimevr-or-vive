import React, { useState } from "react";
import * as FBT from "./FBT"

type FBTTableChoice = {
    system: FBT.System
    config: string
}

type FBTTableProps = {
    initialChoices: FBTTableChoice[]
};

function sum(prices: number[]) {
    return prices.reduce((a, v) => a + v, 0);
}

function toDollars(priceCents: number) {
    return `$${Math.round(priceCents / 100).toFixed()}`;
}

function FBTTable(props: FBTTableProps): React.ReactNode {
    const [ choices, setState ] = useState(props.initialChoices);

    return (
        <table>
            <thead>
                <tr>
                    <th></th>
                    {choices.map(({ system }) => (
                        <th key={system.key} className="system">{system.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Configuration</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            <select>
                                {Object.keys(system.configs).map(c => (
                                    <option key={c} value={c} selected={c === config}>{system.configs[c]}</option>
                                ))}
                            </select>
                        </td>
                    ))}
                </tr>
                <tr>
                    <td>Price</td>
                    {choices.map(({ system, config }) => {
                        const itemList = system.itemList(config);
                        const priceCents = sum(itemList.required.map(i => i.count * i.each_price_cents));
                        return (
                            <td key={system.key} className="price">{toDollars(priceCents)}</td>
                        );
                    })}
                </tr>
                <tr>
                    <td>Components</td>
                    {choices.map(({ system, config }) => {
                        const itemList = system.itemList(config);
                        return (
                            <td key={system.key}>
                                <table>
                                    <tr>
                                        <td colSpan={3}>Required</td>
                                    </tr>
                                    {itemList.required.map((item, i) => (
                                        <tr key={i}>
                                            <td><a href={item.link.toString()} target="_blank">{item.name}</a></td>
                                            <td>{item.count}x</td>
                                            <td>{toDollars(item.each_price_cents)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td></td>
                                        <td>Total:</td>
                                        <td>{toDollars(sum(itemList.required.map(i => i.count * i.each_price_cents)))}</td>
                                    </tr>
                                    {itemList.optional.length > 0 && (
                                        <>
                                            <tr>
                                                <td colSpan={3}>Recommended</td>
                                            </tr>
                                            {itemList.optional.map((item, i) => (
                                                <tr key={i}>
                                                    <td><a href={item.link.toString()} target="_blank">{item.name}</a></td>
                                                    <td>{item.count}x</td>
                                                    <td>{toDollars(item.each_price_cents)}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td></td>
                                                <td>Total:</td>
                                                <td>{toDollars(sum(itemList.required.map(i => i.count * i.each_price_cents)) +
                                                    sum(itemList.optional.map(i => i.count * i.each_price_cents)))}</td>
                                            </tr>
                                        </>
                                    )}
                                </table>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    <td>Availability</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            {system.availability(config)}
                        </td>
                    ))}
                </tr>
                <tr>
                    <td>Tracking</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            {system.tracking(config)}
                        </td>
                    ))}
                </tr>
                <tr>
                    <td>Battery Life</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            {system.battery_life(config)}
                        </td>
                    ))}
                </tr>
                <tr>
                    <td>Weight</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            {system.weight(config)}
                        </td>
                    ))}
                </tr>
                <tr>
                    <td>Size</td>
                    {choices.map(({ system, config }) => (
                        <td key={system.key}>
                            {system.volume(config)}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    )
}

export default FBTTable;
