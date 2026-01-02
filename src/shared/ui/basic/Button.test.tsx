import { describe, it, expect, vi } from 'vitest';

import { render, screen, fireEvent } from '@/test/test-utils';

import Button from './Button';

describe('Button', () => {
    it('버튼이 정상적으로 렌더링되어야 한다', () => {
        render(<Button>테스트 버튼</Button>);
        expect(screen.getByRole('button', { name: '테스트 버튼' })).toBeInTheDocument();
    });

    it('primary variant가 올바른 스타일을 적용해야 한다', () => {
        render(<Button variant="primary">Primary 버튼</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-primary-2');
        expect(button).toHaveClass('text-white');
    });

    it('white variant가 올바른 스타일을 적용해야 한다', () => {
        render(<Button variant="white">White 버튼</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-white');
        expect(button).toHaveClass('text-gray-700');
    });

    it('disabled 상태가 정상적으로 적용되어야 한다', () => {
        render(
            <Button variant="primary" disabled>
                비활성화 버튼
            </Button>
        );
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('클릭 이벤트가 정상적으로 호출되어야 한다', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>클릭 버튼</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('비활성화된 버튼은 클릭 이벤트가 호출되지 않아야 한다', () => {
        const handleClick = vi.fn();
        render(
            <Button onClick={handleClick} disabled>
                비활성화 버튼
            </Button>
        );

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('커스텀 className이 정상적으로 적용되어야 한다', () => {
        render(<Button className="custom-class">커스텀 버튼</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('children으로 숫자가 전달되어도 정상 렌더링되어야 한다', () => {
        render(<Button>{123}</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('123');
    });
});
