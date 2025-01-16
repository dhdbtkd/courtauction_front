'use client';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const Button = styled.button`
    background-color: #0070f3;
    color: hotpink;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
        background-color: #005bb5;
    }
`;

export const Buttons = ({ children }: { children?: ReactNode }) => {
    return <Button>Click me!{children}</Button>;
};
